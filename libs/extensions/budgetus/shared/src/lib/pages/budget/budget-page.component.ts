import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import {
  BUDGETUS_SERVICE,
  IBudgetLineItem,
  IBudgetOverridePatch,
  IBudgetRollup,
  IBudgetusService,
  IMoney,
  maskSurpriseLineItems,
} from '@sneat/extension-budgetus-contract';
import {
  SpaceBaseComponent,
  SpaceComponentBaseParams,
} from '@sneat/space-components';
import { ClassName } from '@sneat/ui';
import { Subscription } from 'rxjs';
import { EditBudgetLineModalComponent } from './edit-budget-line-modal.component';

// The Budget tab (budget-tab-mvp.md): a read-only rollup of derived budget
// line items (asset renewals + happenings/gift budgets), grouped by month,
// with a per-line edit affordance for the Surpriseless override (target
// amount + surprise-hide). This is a top-level tab (reached from the space
// menu, mirroring the existing "Lists" item) rather than a page nested under
// another page, so — like ListsPageComponent's appId==='budgetus' branch —
// it shows a menu button rather than a back button.
@Component({
  selector: 'budgetus-budget-page',
  templateUrl: './budget-page.component.html',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonSpinner,
    IonList,
    IonItemGroup,
    IonItemDivider,
    IonItem,
    IonLabel,
    IonNote,
    IonBadge,
  ],
  providers: [
    { provide: ClassName, useValue: 'BudgetPageComponent' },
    SpaceComponentBaseParams,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetPageComponent extends SpaceBaseComponent {
  private readonly budgetusService = inject<IBudgetusService>(BUDGETUS_SERVICE);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);

  protected readonly $rollup = signal<IBudgetRollup | undefined>(undefined);
  protected readonly $error = signal<Error | undefined>(undefined);
  // Canonical tri-state formula (sneat-specs states.md): loading is "space
  // known, rollup not arrived yet, no error" — distinct from "loaded, empty".
  protected readonly $loading = computed(
    () => !!this.$spaceID() && this.$rollup() === undefined && !this.$error(),
  );

  // Demo-only escape hatch for the surprise-hiding mechanic (see
  // maskSurpriseLineItems doc comment) — lets a reviewer see the masked vs.
  // unmasked view without a second signed-in user.
  protected readonly $revealSurprises = signal(false);

  protected readonly $displayMonths = computed(() => {
    const rollup = this.$rollup();
    const reveal = this.$revealSurprises();
    if (!rollup) {
      return [];
    }
    return rollup.byMonth.map((group) => ({
      ...group,
      items: maskSurpriseLineItems(group.items, { reveal }),
    }));
  });

  private budgetSub?: Subscription;

  constructor() {
    super();
    this.spaceIDChanged$
      .pipe(this.takeUntilDestroyed())
      .subscribe((spaceID) => this.loadBudget(spaceID));
  }

  private loadBudget(spaceID: string | undefined): void {
    this.budgetSub?.unsubscribe();
    this.$rollup.set(undefined);
    this.$error.set(undefined);
    if (!spaceID) {
      return;
    }
    this.budgetSub = this.budgetusService
      .watchBudget(spaceID)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (rollup) => this.$rollup.set(rollup),
        error: (err: unknown) => {
          this.errorLogger.logError(err, 'Failed to load budget');
          this.$error.set(err instanceof Error ? err : new Error(String(err)));
        },
      });
  }

  protected reload(): void {
    this.loadBudget(this.$spaceID());
  }

  protected formatMonth(monthISO: string): string {
    if (!monthISO) {
      return '';
    }
    const [year, month] = monthISO.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  protected formatMoney(money?: IMoney): string {
    if (!money) {
      return '';
    }
    return `${money.value} ${money.currency}`;
  }

  protected iconFor(item: IBudgetLineItem): string {
    switch (item.source) {
      case 'asset-renewal':
        return 'shield-checkmark-outline';
      case 'gift':
        return 'gift-outline';
      default:
        return 'calendar-outline';
    }
  }

  protected async openEditLineItemModal(item: IBudgetLineItem): Promise<void> {
    if (item.isSurprise && !this.$revealSurprises()) {
      // Masked lines can't be meaningfully edited without first revealing
      // them — avoids an editor accidentally reading "🎁 Hidden surprise" as
      // the real title while changing the target amount.
      await this.presentToast(
        'Reveal surprises first to edit this line',
        false,
      );
      return;
    }
    const modal = await this.modalCtrl.create({
      component: EditBudgetLineModalComponent,
      componentProps: { lineItem: item },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel' || !data) {
      return;
    }
    const spaceID = this.$spaceID();
    if (!spaceID) {
      return;
    }
    try {
      await this.budgetusService.setOverride(
        spaceID,
        item.id,
        data as IBudgetOverridePatch,
      );
      await this.presentToast('Budget updated', false);
    } catch (err) {
      this.errorLogger.logError(err, 'Failed to save budget override');
      await this.presentToast('Failed to save changes', true);
    }
  }

  private async presentToast(message: string, isError: boolean): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: isError ? undefined : 2000,
      color: isError ? 'danger' : undefined,
      position: isError ? 'middle' : undefined,
      buttons: [{ role: 'cancel', text: 'OK' }],
    });
    await toast.present();
  }
}

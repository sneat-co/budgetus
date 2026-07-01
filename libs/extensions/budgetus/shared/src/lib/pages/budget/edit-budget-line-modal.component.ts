import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  IBudgetLineItem,
  IBudgetOverridePatch,
} from '@sneat/extension-budgetus-contract';
import { SneatBaseModalComponent } from '@sneat/ui';

// A focused edit modal for a single budget line item's override: the target
// amount (esp. for gift lines with no derived amount) and the Surpriseless
// surprise-hide flag. Structured per sneat-specs modals.md: header (title +
// close) / content (fields) / footer (Cancel + primary Save). Dismisses with
// an IBudgetOverridePatch on save, or role:'cancel' with no data otherwise —
// the caller (BudgetPageComponent) is responsible for calling
// IBudgetusService.setOverride() and toasting the result.
@Component({
  selector: 'budgetus-edit-budget-line-modal',
  templateUrl: './edit-budget-line-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonFooter,
  ],
})
export class EditBudgetLineModalComponent
  extends SneatBaseModalComponent
  implements OnInit
{
  @Input() lineItem!: IBudgetLineItem;

  protected targetValue = 0;
  protected targetCurrency = 'EUR';
  protected isSurprise = false;

  ngOnInit(): void {
    const seedAmount = this.lineItem.targetAmount ?? this.lineItem.amount;
    this.targetValue = seedAmount?.value ?? 0;
    this.targetCurrency = seedAmount?.currency ?? 'EUR';
    this.isSurprise = !!this.lineItem.isSurprise;
  }

  protected cancel(): void {
    this.dismissModal(undefined, 'cancel');
  }

  protected save(): void {
    const patch: IBudgetOverridePatch = {
      targetAmount: { currency: this.targetCurrency, value: this.targetValue },
      isSurprise: this.isSurprise,
    };
    this.dismissModal(patch, 'save');
  }
}

import { Injectable, inject } from '@angular/core';
import {
  IBudgetOverridePatch,
  IBudgetRollup,
} from '@sneat/extension-budgetus-contract';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { applyOverrides, computeBudgetRollup, projectBudgetLineItems } from './budget-projection';
import { BudgetusDataSource } from './budgetus-data-source';
import { BudgetusOverridesStore } from './budgetus-overrides-store';

// Composes the data source + overrides store + pure projection functions into
// the `watchBudget()` / `setOverride()` surface that IBudgetusService exposes.
// Kept separate from BudgetusService (../services/budgetus.service.ts) so the
// projection/override wiring can be unit tested without dragging in
// ModuleSpaceItemService/Firestore.
@Injectable()
export class BudgetusProjectionService {
  private readonly dataSource = inject(BudgetusDataSource);
  private readonly overridesStore = inject(BudgetusOverridesStore);

  // Emits whenever an override is saved, so watchBudget() re-derives the
  // rollup for every subscriber without needing a round-trip to a backend.
  private readonly overridesChanged$ = new BehaviorSubject<void>(undefined);

  watchBudget(spaceID: string): Observable<IBudgetRollup> {
    return combineLatest([
      this.dataSource.getAssetRenewals(spaceID),
      this.dataSource.getUpcomingHappenings(spaceID),
      this.overridesChanged$,
    ]).pipe(
      map(([renewals, happenings]) => {
        const items = projectBudgetLineItems(renewals, happenings);
        const overrides = this.overridesStore.load(spaceID);
        const withOverrides = applyOverrides(items, overrides);
        return computeBudgetRollup(withOverrides);
      }),
    );
  }

  async setOverride(
    spaceID: string,
    lineItemId: string,
    patch: IBudgetOverridePatch,
  ): Promise<void> {
    this.overridesStore.save(spaceID, lineItemId, patch);
    this.overridesChanged$.next();
  }
}

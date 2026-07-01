import { Injectable, inject } from '@angular/core';
import {
  IBudgetOverridePatch,
  IBudgetRollup,
} from '@sneat/extension-budgetus-contract';
import { Observable } from 'rxjs';
import { BudgetusProjectionService } from '../budget/budgetus-projection.service';
import { ListService } from './list.service';

// The single concrete implementation bound to BUDGETUS_SERVICE (see
// provide-budgetus-internal.ts). Extends ListService (the pre-existing lists
// scaffold) so IBudgetusService's full surface — the lists methods plus the
// Budget tab's watchBudget()/setOverride() — is satisfied by one class,
// without touching list.service.ts. The budget-specific logic itself lives in
// BudgetusProjectionService (composition over the pure projection functions +
// data source + overrides store), which this class simply delegates to.
@Injectable()
export class BudgetusService extends ListService {
  private readonly projection = inject(BudgetusProjectionService);

  watchBudget(spaceID: string): Observable<IBudgetRollup> {
    return this.projection.watchBudget(spaceID);
  }

  setOverride(
    spaceID: string,
    lineItemId: string,
    patch: IBudgetOverridePatch,
  ): Promise<void> {
    return this.projection.setOverride(spaceID, lineItemId, patch);
  }
}

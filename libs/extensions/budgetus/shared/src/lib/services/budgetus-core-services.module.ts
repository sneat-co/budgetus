import { NgModule } from '@angular/core';
import {
  IBudgetusAppStateService,
  BudgetusAppStateService,
} from './budgetus-app-state.service';

// Provides the template UI-state service. The concrete ListService is no longer
// provided here — it is bound to the BUDGETUS_SERVICE contract token by
// provideBudgetusInternal() at app bootstrap (the app is the composition root).
@NgModule({
  providers: [
    {
      provide: IBudgetusAppStateService,
      useClass: BudgetusAppStateService,
    },
  ],
})
export class BudgetusCoreServicesModule {}

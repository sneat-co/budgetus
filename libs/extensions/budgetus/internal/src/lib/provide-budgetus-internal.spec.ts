import { BUDGETUS_SERVICE } from '@sneat/extension-budgetus-contract';
import { BudgetusDataSource, DemoBudgetusDataSource } from './budget';
import { BudgetusService, ListService } from './services';
import { provideBudgetusInternal } from './provide-budgetus-internal';

describe('provideBudgetusInternal', () => {
  it('provides ListService and BudgetusService and binds BUDGETUS_SERVICE to BudgetusService', () => {
    const providers = provideBudgetusInternal();
    expect(providers).toContain(ListService);
    expect(providers).toContain(BudgetusService);
    expect(providers).toContainEqual({
      provide: BUDGETUS_SERVICE,
      useExisting: BudgetusService,
    });
  });

  it('binds BudgetusDataSource to the demo data source (prototype)', () => {
    const providers = provideBudgetusInternal();
    expect(providers).toContainEqual({
      provide: BudgetusDataSource,
      useClass: DemoBudgetusDataSource,
    });
  });
});

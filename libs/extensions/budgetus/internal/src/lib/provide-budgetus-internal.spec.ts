import { BUDGETUS_SERVICE } from '@sneat/extension-budgetus-contract';
import { ListService } from './services';
import { provideBudgetusInternal } from './provide-budgetus-internal';

describe('provideBudgetusInternal', () => {
  it('provides ListService and binds it to BUDGETUS_SERVICE', () => {
    const providers = provideBudgetusInternal();
    expect(providers).toContain(ListService);
    expect(providers).toContainEqual({
      provide: BUDGETUS_SERVICE,
      useExisting: ListService,
    });
  });
});

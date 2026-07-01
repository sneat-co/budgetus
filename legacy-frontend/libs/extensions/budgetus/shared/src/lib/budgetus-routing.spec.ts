import { budgetusRoutes } from './budgetus-routing';

describe('budgetusRoutes', () => {
  it('exposes the budget route', () => {
    expect(budgetusRoutes.some((r) => r.path === 'budget')).toBe(true);
  });

  it('lazy-loads every route via loadComponent', () => {
    for (const route of budgetusRoutes) {
      expect(typeof route.loadComponent).toBe('function');
    }
  });
});

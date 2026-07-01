import { budgetusRoutes } from './budgetus-routing';

describe('budgetusRoutes', () => {
  it('exposes the budget tab route', () => {
    expect(budgetusRoutes.some((r) => r.path === 'budget')).toBe(true);
  });

  it('exposes the lists overview route', () => {
    expect(budgetusRoutes.some((r) => r.path === 'lists')).toBe(true);
  });

  it('exposes the list detail route with listType + listID params', () => {
    expect(
      budgetusRoutes.some((r) => r.path === 'list/:listType/:listID'),
    ).toBe(true);
  });

  it('lazy-loads every route via loadComponent', () => {
    for (const route of budgetusRoutes) {
      expect(typeof route.loadComponent).toBe('function');
    }
  });
});

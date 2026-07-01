import { Route } from '@angular/router';

export const budgetusRoutes: Route[] = [
  {
    path: 'budget',
    data: { title: 'Budget' },
    loadComponent: () =>
      import('./pages/budget/budget-page.component').then(
        (m) => m.BudgetPageComponent,
      ),
  },
];

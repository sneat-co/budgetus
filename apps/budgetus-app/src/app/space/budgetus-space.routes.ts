import { Route } from '@angular/router';
import {
  budgetusRoutes,
  BudgetusSpaceMenuComponent,
} from '@sneat/extension-budgetus-shared';
import { SpaceComponentBaseParams } from '@sneat/space-components';

// Thin, budgetus-only space shell. It provides SpaceComponentBaseParams (which
// resolves the active space from the :spaceType/:spaceID route params) to all
// children, then mounts ONLY the budgetus routes — unlike sneat-app's
// @sneat/space-pages, which bundles every extension. This keeps budgetus-app
// decoupled while reusing the published @sneat/space-components context wiring.
export const budgetusSpaceRoutes: Route[] = [
  {
    path: '',
    providers: [SpaceComponentBaseParams],
    children: [
      {
        // budgetus-specific side menu (space selector + the space's lists) instead
        // of the generic SpaceMenuComponent, which hardcodes every sneat-app
        // extension (Assets, Budget, Contacts, …) — none of which exist here.
        path: '',
        component: BudgetusSpaceMenuComponent,
        outlet: 'menu',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'lists',
      },
      ...budgetusRoutes,
    ],
  },
];

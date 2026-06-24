import { Route } from '@angular/router';
import { budgetusRoutes as budgetusExtensionRoutes } from '@sneat/extension-budgetus-shared';
import { SpaceComponentBaseParams } from '@sneat/space-components';

// Thin, budgetus-only space shell. It provides SpaceComponentBaseParams (which
// resolves the active space from the :spaceType/:spaceID route params) to all
// children, then mounts ONLY the budgetus routes — unlike sneat-app's
// @sneat/space-pages, which bundles every extension. This keeps budgetus.app
// decoupled while reusing the published @sneat/space-components context wiring.
export const budgetusSpaceRoutes: Route[] = [
  {
    path: '',
    providers: [SpaceComponentBaseParams],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'budget',
      },
      ...budgetusExtensionRoutes,
    ],
  },
];

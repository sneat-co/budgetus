// Main entry point for template.app
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  getStandardSneatProviders,
  provideAppInfo,
  provideRolesByType,
} from '@sneat/app';
import type { SneatApp } from '@sneat/core';
import { authRoutes } from '@sneat/auth-ui';
import { provideBudgetusInternal } from '@sneat/extension-budgetus-internal';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { budgetusAppEnvironmentConfig } from './environments/environment';
import { registerIonicons } from './register-ionicons';

bootstrapApplication(App, {
  providers: [
    ...getStandardSneatProviders(budgetusAppEnvironmentConfig),
    // Bind the template contract token (BUDGETUS_SERVICE) to its concrete
    // implementation. The app is the composition root and may wire -internal.
    ...provideBudgetusInternal(),
    // `as SneatApp`: the template's placeholder appId isn't in @sneat/core's
    // SneatApp union yet. Remove the cast once @sneat/core allows any string
    // (or once the renamed app's id is registered).
    provideAppInfo({ appId: 'budgetus' as SneatApp, appTitle: 'Budgetus.app' }),
    provideRouter([...appRoutes, ...authRoutes]),
    provideRolesByType(undefined),
  ],
}).catch((err) => console.error(err));

registerIonicons();

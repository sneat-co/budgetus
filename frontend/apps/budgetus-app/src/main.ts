// Main entry point for budgetus.app
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  getStandardSneatProviders,
  provideAppInfo,
  provideRolesByType,
} from '@sneat/app';
import { authRoutes } from '@sneat/auth-ui';
import { SneatApp } from '@sneat/core';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';
import { budgetusAppEnvironmentConfig } from './environments/environment';
import { registerIonicons } from './register-ionicons';

bootstrapApplication(App, {
  providers: [
    ...getStandardSneatProviders(budgetusAppEnvironmentConfig),
    // 'budgetus' is not yet a member of @sneat/core's SneatApp union (the
    // published platform predates this niche app). Cast locally until 'budgetus'
    // is added to SneatApp the next time the platform is touched — this
    // extraction must not modify platform packages.
    provideAppInfo({ appId: 'budgetus' as SneatApp, appTitle: 'Budgetus.app' }),
    provideRouter([...appRoutes, ...authRoutes]),
    provideRolesByType(undefined),
  ],
}).catch((err) => console.error(err));

registerIonicons();

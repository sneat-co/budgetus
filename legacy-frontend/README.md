# budgetus frontend

Nx workspace for the budgetus frontend: the standalone `budgetus-app` and the
publishable `@sneat/extension-budgetus-{contract,shared,internal}` libraries
(extension library-architecture convention — see the
[root README](../README.md#library-structure-extension-library-architecture-convention)).

- **Nx** 22 · **Angular** 21 · **Ionic** 8 · **pnpm**

## Setup

```bash
pnpm install
```

## Common tasks

```bash
pnpm exec nx serve budgetus-app          # run the app locally
pnpm exec nx build ext-budgetus-shared   # build a publishable tier library
pnpm exec nx run-many -t lint test build
pnpm exec nx e2e budgetus-app-e2e        # end-to-end tests
```

## Layout

```
frontend/
├── apps/
│   └── budgetus-app/                  # standalone budgetus.app (Ionic shell)
└── libs/
    └── extensions/budgetus/
        ├── contract/                # @sneat/extension-budgetus-contract
        ├── shared/                  # @sneat/extension-budgetus-shared
        └── internal/                # @sneat/extension-budgetus-internal
```

> Projects are generated incrementally during the extraction; see the repo
> root README for the overall plan.

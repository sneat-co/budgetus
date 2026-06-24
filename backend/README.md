# budgetus backend

Go service for budgetus. Module path: `github.com/sneat-co/budgetus/backend`
(the module is rooted here in `backend/`, not at the repo root).

> **Status: scaffold.** Only a health endpoint is implemented. Budgetus domain
> endpoints are intentionally deferred.

## Requirements

- Go 1.26+

## Run

```bash
go run ./cmd/budgetusd        # listens on :8080 (override with BUDGETUS_ADDR)
curl localhost:8080/health    # -> 200 {"status":"ok"}
```

## Build & test

```bash
go build ./...
go test ./...
```

## Layout

```
backend/
├── budgetusext/        # Extension() — sneat-go-core extension config
├── cmd/budgetusd/      # main package — HTTP server entrypoint
├── const4budgetus/     # ExtensionID constant
├── dbo4budgetus/       # domain objects (Obligation)
└── internal/health/    # health-check handler + test
```

// Command budgetusd is the budgetus backend service.
//
// This is a scaffold: it currently exposes only a health endpoint. Budgetus
// domain endpoints are intentionally not implemented yet.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/sneat-co/budgetus/backend/internal/health"
)

func main() {
	addr := os.Getenv("BUDGETUS_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	mux := http.NewServeMux()
	mux.Handle("GET /health", health.Handler())

	log.Printf("budgetusd listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("budgetusd failed: %v", err)
	}
}

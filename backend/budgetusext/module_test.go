package budgetusext

import (
	"testing"

	"github.com/sneat-co/budgetus/backend/const4budgetus"
	"github.com/sneat-co/sneat-go-core/extension"
)

func TestModule(t *testing.T) {
	m := Extension()
	extension.AssertExtension(t, m, extension.Expected{
		ExtID:         const4budgetus.ExtensionID,
		HandlersCount: 0,
		DelayersCount: 0,
	})
}

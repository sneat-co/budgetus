package budgetusext

import (
	"github.com/sneat-co/budgetus/backend/const4budgetus"
	"github.com/sneat-co/sneat-go-core/extension"
)

func Extension() extension.Config {
	return extension.NewExtension(const4budgetus.ExtensionID)
}

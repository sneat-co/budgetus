import { Injectable } from '@angular/core';
import { IBudgetOverridePatch } from '@sneat/extension-budgetus-contract';

// Fable: prototype persistence — localStorage, keyed per space. The real
// store (budget-tab-mvp.md Section 3) is Firestore at
// `/spaces/{spaceID}/ext/budgetus/overrides/{lineItemId}`, written via the
// standard space-item service (mirroring ListService's Firestore wiring in
// ../services/list.service.ts) or a small budgetusd write route. Swap this
// class's load()/save() bodies for that Firestore read/write when wiring to a
// live app; BudgetusProjectionService's public surface does not need to
// change.
@Injectable()
export class BudgetusOverridesStore {
  private storageKey(spaceID: string): string {
    return `budgetus:overrides:${spaceID}`;
  }

  load(spaceID: string): Record<string, IBudgetOverridePatch> {
    try {
      const raw = localStorage.getItem(this.storageKey(spaceID));
      return raw
        ? (JSON.parse(raw) as Record<string, IBudgetOverridePatch>)
        : {};
    } catch (e) {
      console.error('Failed to parse budgetus overrides from localStorage', e);
      return {};
    }
  }

  save(
    spaceID: string,
    lineItemId: string,
    patch: IBudgetOverridePatch,
  ): void {
    const all = this.load(spaceID);
    all[lineItemId] = { ...all[lineItemId], ...patch };
    localStorage.setItem(this.storageKey(spaceID), JSON.stringify(all));
  }
}

import { IMoney } from '@sneat/extension-budgetus-contract';

// Prototype-only source shapes. These stand in for the reused DTOs the plan
// calls for (budget-tab-mvp.md Section 3 "Reused DTOs" + Section 4 reuse map):
//   - IAssetRenewalSourceItem  ~ @sneat/extension-assetus-contract's
//     `IRenewalItem { assetID, assetName?, category?, kind, dueOn, period }`
//   - IHappeningSourceItem     ~ @sneat/extension-calendarius-contract's
//     `IHappeningBrief`/`IHappeningSlot.repeats` + `IHappeningPrice`
//
// They are intentionally NOT the real contract types: this standalone
// budgetus-repo prototype doesn't depend on the assetus/calendarius contract
// packages (no live Space data available here). See budgetus-data-source.ts
// for the seam where a real data source would map the real DTOs into these
// shapes (or these shapes could be replaced outright by the real ones).

export type AssetRenewalKind =
  | 'insurance'
  | 'service'
  | 'tax'
  | 'nct'
  | 'warranty'
  | 'other';

export interface IAssetRenewalSourceItem {
  assetID: string;
  assetName: string;
  category?: string;
  kind: AssetRenewalKind;
  dueOn: string; // ISO date (yyyy-mm-dd)
  amount?: IMoney; // Assetus insurance docs currently have no premium field
  // (budget-tab-mvp.md Open Question 3) — undefined until the user sets a
  // target via a budgetus override.
}

export interface IHappeningSourceItem {
  happeningID: string;
  title: string;
  dateISO: string; // ISO date (yyyy-mm-dd) of the next occurrence
  repeats: 'once' | 'yearly';
  price?: IMoney;
  // Yearly happenings tagged as a birthday/anniversary become 'gift' budget
  // lines (see projectHappeningLineItem in budget-projection.ts).
  isGift?: boolean;
}

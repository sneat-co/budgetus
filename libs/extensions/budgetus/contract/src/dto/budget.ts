// Budget tab read-model types (see backstage roadmap:
// docs/roadmaps/budget-tab-mvp.md, Section 3 "Data model").
//
// IBudgetLineItem is a COMPUTED projection, not a persisted record: it is
// derived from Assetus asset renewals + Calendarius happenings and re-derived
// on every read. Only per-line overrides (targetAmount / isSurprise) are
// persisted (see IBudgetOverridePatch below + the overrides store in
// @sneat/extension-budgetus-internal).

export interface IMoney {
  currency: string;
  value: number;
}

// Where a budget line item was derived from. 'gift' is a specialisation of
// 'happening' — a yearly happening (birthday/anniversary) tagged as a gift
// occasion, which is the flagship Surpriseless scenario.
export type BudgetLineSource = 'asset-renewal' | 'happening' | 'gift';

export interface IBudgetLineItem {
  id: string;
  title: string;
  dateISO: string; // ISO date (yyyy-mm-dd) of the next occurrence/due date
  amount: IMoney;
  source: BudgetLineSource;
  sourceRef?: string; // id of the source asset/happening, for drill-through
  targetAmount?: IMoney; // user-set override (esp. gift lines)
  isSurprise?: boolean; // Surpriseless "surprise-hiding" flag (gift lines)
}

export interface IBudgetMonthGroup {
  monthISO: string; // 'YYYY-MM'
  total: IMoney;
  items: IBudgetLineItem[];
}

export interface IBudgetRollup {
  byMonth: IBudgetMonthGroup[];
  annualTotal: IMoney;
  mostExpensiveMonthISO: string;
}

// The only fields a budgetus overrides record may patch onto a computed line
// item. Kept separate from IBudgetLineItem so the wire/storage shape can't
// accidentally include projection-only computed fields (title, amount, ...).
export interface IBudgetOverridePatch {
  targetAmount?: IMoney;
  isSurprise?: boolean;
}

export function monthISOOf(dateISO: string): string {
  return dateISO.slice(0, 7);
}

// Surprise-hiding (Surpriseless mechanic — budget-tab-mvp.md Section 1 and
// Open Question 5). A gift line item flagged `isSurprise` must not reveal its
// real title to the person it is a surprise for.
//
// This prototype has no recipient-linking yet (Open Question 1 in the plan is
// still unresolved — there's no "this gift is for user X" edge to compare
// against the current viewer), so for now it masks every `isSurprise` line
// uniformly rather than per-viewer. `reveal: true` is a demo-only escape hatch
// the Budget page uses so a reviewer/owner can see the underlying data
// without needing a second signed-in user.
export function maskSurpriseLineItems(
  items: IBudgetLineItem[],
  options?: { reveal?: boolean },
): IBudgetLineItem[] {
  if (options?.reveal) {
    return items;
  }
  return items.map((item) =>
    item.isSurprise
      ? { ...item, title: '🎁 Hidden surprise', sourceRef: undefined }
      : item,
  );
}

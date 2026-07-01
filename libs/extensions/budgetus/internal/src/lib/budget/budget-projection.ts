import {
  IBudgetLineItem,
  IBudgetOverridePatch,
  IBudgetRollup,
  IMoney,
  monthISOOf,
} from '@sneat/extension-budgetus-contract';
import {
  AssetRenewalKind,
  IAssetRenewalSourceItem,
  IHappeningSourceItem,
} from './budgetus-source-types';

// The read-model projection: turns raw source items (asset renewals +
// happenings) into IBudgetLineItem[], then applies overrides and rolls the
// result up by month/year. See budget-tab-mvp.md Section 3 "Recommendation:
// read-model projection + a thin overrides store" — none of this is
// persisted; it is recomputed on every read.

const RENEWAL_KIND_LABEL: Record<AssetRenewalKind, string> = {
  insurance: 'insurance renewal',
  service: 'service',
  tax: 'tax',
  nct: 'NCT',
  warranty: 'warranty renewal',
  other: 'renewal',
};

const NO_AMOUNT: IMoney = { currency: 'EUR', value: 0 };

export function projectAssetRenewalLineItem(
  renewal: IAssetRenewalSourceItem,
): IBudgetLineItem {
  return {
    id: `asset-renewal:${renewal.assetID}`,
    title: `${renewal.assetName} — ${RENEWAL_KIND_LABEL[renewal.kind]}`,
    dateISO: renewal.dueOn,
    amount: renewal.amount ?? NO_AMOUNT,
    source: 'asset-renewal',
    sourceRef: renewal.assetID,
  };
}

export function projectHappeningLineItem(
  happening: IHappeningSourceItem,
): IBudgetLineItem {
  // Yearly happenings tagged as gifts (birthdays/anniversaries) are the
  // Surpriseless flagship scenario (budget-tab-mvp.md Section 1); every other
  // priced happening is a plain 'happening' line.
  const isGiftLine = !!happening.isGift && happening.repeats === 'yearly';
  return {
    id: `happening:${happening.happeningID}`,
    title: happening.title,
    dateISO: happening.dateISO,
    amount: happening.price ?? NO_AMOUNT,
    source: isGiftLine ? 'gift' : 'happening',
    sourceRef: happening.happeningID,
  };
}

/** Projects raw renewals + happenings into line items, sorted by date. */
export function projectBudgetLineItems(
  renewals: IAssetRenewalSourceItem[],
  happenings: IHappeningSourceItem[],
): IBudgetLineItem[] {
  const items = [
    ...renewals.map(projectAssetRenewalLineItem),
    ...happenings.map(projectHappeningLineItem),
  ];
  return items.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

/**
 * Applies persisted overrides (target amount / surprise flag) onto the
 * matching computed line items, keyed by `IBudgetLineItem.id`. Items with no
 * matching override pass through unchanged.
 */
export function applyOverrides(
  items: IBudgetLineItem[],
  overridesByLineItemId: Readonly<Record<string, IBudgetOverridePatch>>,
): IBudgetLineItem[] {
  return items.map((item) => {
    const override = overridesByLineItemId[item.id];
    if (!override) {
      return item;
    }
    return {
      ...item,
      ...(override.targetAmount !== undefined
        ? { targetAmount: override.targetAmount }
        : {}),
      ...(override.isSurprise !== undefined
        ? { isSurprise: override.isSurprise }
        : {}),
    };
  });
}

function sumLineItemValues(items: IBudgetLineItem[]): number {
  // Prefer the user's targetAmount (e.g. a gift budget) over the raw derived
  // amount when both exist, since the target is the number the user actually
  // wants to plan/budget against.
  return items.reduce(
    (sum, item) => sum + (item.targetAmount?.value ?? item.amount.value),
    0,
  );
}

/**
 * Groups line items by month and computes monthly totals, the annual total,
 * and the most expensive month.
 *
 * MVP simplification (budget-tab-mvp.md Section 2 non-goals: "No
 * multi-currency conversion / FX"): assumes every line item shares one
 * currency. Uses the first item's currency (or 'EUR' if there are none) and
 * sums raw numeric values — a real multi-currency rollup would group/sum per
 * currency instead.
 */
export function computeBudgetRollup(items: IBudgetLineItem[]): IBudgetRollup {
  const currency = items[0]?.amount.currency ?? 'EUR';

  const byMonthMap = new Map<string, IBudgetLineItem[]>();
  for (const item of items) {
    const monthISO = monthISOOf(item.dateISO);
    const group = byMonthMap.get(monthISO);
    if (group) {
      group.push(item);
    } else {
      byMonthMap.set(monthISO, [item]);
    }
  }

  const byMonth = Array.from(byMonthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthISO, monthItems]) => ({
      monthISO,
      total: { currency, value: sumLineItemValues(monthItems) },
      items: monthItems,
    }));

  const annualTotal: IMoney = { currency, value: sumLineItemValues(items) };

  let mostExpensiveMonthISO = '';
  let highestTotal = -Infinity;
  for (const group of byMonth) {
    if (group.total.value > highestTotal) {
      highestTotal = group.total.value;
      mostExpensiveMonthISO = group.monthISO;
    }
  }

  return { byMonth, annualTotal, mostExpensiveMonthISO };
}

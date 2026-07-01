import { maskSurpriseLineItems } from '@sneat/extension-budgetus-contract';
import {
  applyOverrides,
  computeBudgetRollup,
  projectAssetRenewalLineItem,
  projectBudgetLineItems,
  projectHappeningLineItem,
} from './budget-projection';
import {
  IAssetRenewalSourceItem,
  IHappeningSourceItem,
} from './budgetus-source-types';

const carInsurance: IAssetRenewalSourceItem = {
  assetID: 'car-1',
  assetName: 'Car',
  kind: 'insurance',
  dueOn: '2026-09-01',
  amount: { currency: 'EUR', value: 620 },
};

const homeInsurance: IAssetRenewalSourceItem = {
  assetID: 'home-1',
  assetName: 'Home',
  kind: 'insurance',
  dueOn: '2026-11-15',
  amount: { currency: 'EUR', value: 480 },
};

const carService: IAssetRenewalSourceItem = {
  assetID: 'car-1',
  assetName: 'Car',
  kind: 'service',
  dueOn: '2026-09-20',
  amount: { currency: 'EUR', value: 220 },
};

const mumBirthday: IHappeningSourceItem = {
  happeningID: 'mum-birthday',
  title: "Mum's 60th birthday",
  dateISO: '2026-10-12',
  repeats: 'yearly',
  price: { currency: 'EUR', value: 150 },
  isGift: true,
};

const samBirthday: IHappeningSourceItem = {
  happeningID: 'sam-birthday',
  title: "Sam's birthday",
  dateISO: '2026-08-03',
  repeats: 'yearly',
  price: { currency: 'EUR', value: 100 },
  isGift: true,
};

const bookClub: IHappeningSourceItem = {
  happeningID: 'book-club',
  title: 'Book club subscription',
  dateISO: '2026-09-05',
  repeats: 'yearly',
  price: { currency: 'EUR', value: 60 },
  // not a gift — a plain yearly subscription
};

describe('projectAssetRenewalLineItem', () => {
  it('maps an asset renewal to a budget line item', () => {
    const item = projectAssetRenewalLineItem(carInsurance);
    expect(item).toEqual({
      id: 'asset-renewal:car-1',
      title: 'Car — insurance renewal',
      dateISO: '2026-09-01',
      amount: { currency: 'EUR', value: 620 },
      source: 'asset-renewal',
      sourceRef: 'car-1',
    });
  });

  it('defaults amount to 0 when the renewal has no premium (Open Question 3)', () => {
    const item = projectAssetRenewalLineItem({
      assetID: 'car-1',
      assetName: 'Car',
      kind: 'nct',
      dueOn: '2026-09-01',
    });
    expect(item.amount).toEqual({ currency: 'EUR', value: 0 });
  });
});

describe('projectHappeningLineItem', () => {
  it('classifies a yearly happening tagged isGift as a gift line', () => {
    const item = projectHappeningLineItem(mumBirthday);
    expect(item.source).toBe('gift');
    expect(item.title).toBe("Mum's 60th birthday");
  });

  it('classifies a non-gift yearly happening as a happening line', () => {
    const item = projectHappeningLineItem(bookClub);
    expect(item.source).toBe('happening');
  });
});

describe('projectBudgetLineItems', () => {
  it('projects and sorts renewals + happenings by date', () => {
    const items = projectBudgetLineItems(
      [carInsurance, homeInsurance, carService],
      [mumBirthday, samBirthday, bookClub],
    );
    expect(items.map((i) => i.dateISO)).toEqual([
      '2026-08-03',
      '2026-09-01',
      '2026-09-05',
      '2026-09-20',
      '2026-10-12',
      '2026-11-15',
    ]);
    expect(items).toHaveLength(6);
  });
});

describe('applyOverrides', () => {
  it('patches targetAmount and isSurprise onto the matching line item only', () => {
    const items = projectBudgetLineItems([], [mumBirthday, samBirthday]);
    const overridden = applyOverrides(items, {
      'happening:mum-birthday': {
        targetAmount: { currency: 'EUR', value: 200 },
        isSurprise: true,
      },
    });
    const mum = overridden.find((i) => i.id === 'happening:mum-birthday');
    const sam = overridden.find((i) => i.id === 'happening:sam-birthday');
    expect(mum?.targetAmount).toEqual({ currency: 'EUR', value: 200 });
    expect(mum?.isSurprise).toBe(true);
    expect(sam?.targetAmount).toBeUndefined();
    expect(sam?.isSurprise).toBeUndefined();
  });

  it('leaves items unchanged when there is no override for them', () => {
    const items = projectBudgetLineItems([carInsurance], []);
    expect(applyOverrides(items, {})).toEqual(items);
  });
});

describe('computeBudgetRollup', () => {
  it('groups line items by month and sums each month total', () => {
    const items = projectBudgetLineItems(
      [carInsurance, carService], // both due September 2026: 620 + 220
      [mumBirthday], // October 2026: 150
    );
    const rollup = computeBudgetRollup(items);
    const sept = rollup.byMonth.find((m) => m.monthISO === '2026-09');
    const oct = rollup.byMonth.find((m) => m.monthISO === '2026-10');
    expect(sept?.total.value).toBe(840);
    expect(sept?.items).toHaveLength(2);
    expect(oct?.total.value).toBe(150);
  });

  it('computes the annual total across all months', () => {
    const items = projectBudgetLineItems(
      [carInsurance, homeInsurance],
      [mumBirthday],
    );
    const rollup = computeBudgetRollup(items);
    expect(rollup.annualTotal).toEqual({ currency: 'EUR', value: 1250 });
  });

  it('identifies the most expensive month', () => {
    const items = projectBudgetLineItems(
      [carInsurance, homeInsurance, carService], // Sept: 840, Nov: 480
      [mumBirthday], // Oct: 150
    );
    const rollup = computeBudgetRollup(items);
    expect(rollup.mostExpensiveMonthISO).toBe('2026-09');
  });

  it('prefers targetAmount over the raw amount when summing', () => {
    const items = applyOverrides(
      projectBudgetLineItems([], [mumBirthday]),
      {
        'happening:mum-birthday': {
          targetAmount: { currency: 'EUR', value: 300 },
        },
      },
    );
    const rollup = computeBudgetRollup(items);
    expect(rollup.annualTotal.value).toBe(300);
  });

  it('returns an empty rollup for no line items', () => {
    const rollup = computeBudgetRollup([]);
    expect(rollup.byMonth).toEqual([]);
    expect(rollup.annualTotal).toEqual({ currency: 'EUR', value: 0 });
    expect(rollup.mostExpensiveMonthISO).toBe('');
  });
});

describe('surprise-masking end-to-end over projected line items', () => {
  it('masks a gift line item once isSurprise is set via an override', () => {
    const items = applyOverrides(projectBudgetLineItems([], [mumBirthday]), {
      'happening:mum-birthday': { isSurprise: true },
    });
    const masked = maskSurpriseLineItems(items);
    expect(masked[0].title).toBe('🎁 Hidden surprise');
  });

  it('reveals the real title with the demo reveal escape hatch', () => {
    const items = applyOverrides(projectBudgetLineItems([], [mumBirthday]), {
      'happening:mum-birthday': { isSurprise: true },
    });
    const revealed = maskSurpriseLineItems(items, { reveal: true });
    expect(revealed[0].title).toBe("Mum's 60th birthday");
  });
});

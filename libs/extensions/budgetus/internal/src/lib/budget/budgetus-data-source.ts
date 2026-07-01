import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  IAssetRenewalSourceItem,
  IHappeningSourceItem,
} from './budgetus-source-types';

// The seam between the Budget tab's projection logic (budget-projection.ts)
// and wherever the source commitments actually live. An abstract class (not
// an InjectionToken) so it doubles as its own DI token — see
// provide-budgetus-internal.ts, which binds it to DemoBudgetusDataSource for
// this prototype.
export abstract class BudgetusDataSource {
  abstract getAssetRenewals(
    spaceID: string,
  ): Observable<IAssetRenewalSourceItem[]>;
  abstract getUpcomingHappenings(
    spaceID: string,
  ): Observable<IHappeningSourceItem[]>;
}

function isoDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextYearlyOccurrenceISO(monthDay: string): string {
  // monthDay is 'MM-DD'. Finds the next occurrence of that month/day (this
  // year, or next year if it has already passed), so the demo fixtures always
  // look "upcoming" instead of using a fixed year baked into source control.
  const now = new Date();
  const [month, day] = monthDay.split('-').map(Number);
  let candidate = new Date(now.getFullYear(), month - 1, day);
  if (candidate.getTime() < now.getTime()) {
    candidate = new Date(now.getFullYear() + 1, month - 1, day);
  }
  return candidate.toISOString().slice(0, 10);
}

// Fable: prototype demo data — realistic fixtures so the Budget tab renders
// end-to-end without a live sneat-go backend or real Assetus/Calendarius
// data. Swap for a real data source (see AssetusCalendariusDataSource below)
// once this extension is wired into an app that has those services.
@Injectable()
export class DemoBudgetusDataSource extends BudgetusDataSource {
  getAssetRenewals(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _spaceID: string,
  ): Observable<IAssetRenewalSourceItem[]> {
    const renewals: IAssetRenewalSourceItem[] = [
      {
        assetID: 'car-1',
        assetName: 'Car',
        category: 'vehicle',
        kind: 'insurance',
        dueOn: isoDateInDays(62), // ~2 months out
        amount: { currency: 'EUR', value: 620 },
      },
      {
        assetID: 'home-1',
        assetName: 'Home',
        category: 'property',
        kind: 'insurance',
        dueOn: isoDateInDays(120),
        amount: { currency: 'EUR', value: 480 },
      },
      {
        assetID: 'car-1',
        assetName: 'Car',
        category: 'vehicle',
        kind: 'service',
        dueOn: isoDateInDays(45),
        amount: { currency: 'EUR', value: 220 },
      },
    ];
    return of(renewals);
  }

  getUpcomingHappenings(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _spaceID: string,
  ): Observable<IHappeningSourceItem[]> {
    const happenings: IHappeningSourceItem[] = [
      {
        happeningID: 'mum-birthday',
        title: "Mum's 60th birthday",
        dateISO: nextYearlyOccurrenceISO('10-12'),
        repeats: 'yearly',
        price: { currency: 'EUR', value: 150 },
        isGift: true,
      },
      {
        happeningID: 'sam-birthday',
        title: "Sam's birthday",
        dateISO: nextYearlyOccurrenceISO('08-03'),
        repeats: 'yearly',
        price: { currency: 'EUR', value: 100 },
        isGift: true,
      },
      {
        happeningID: 'wedding-anniversary',
        title: 'Wedding anniversary',
        dateISO: nextYearlyOccurrenceISO('06-21'),
        repeats: 'yearly',
        price: { currency: 'EUR', value: 200 },
        isGift: true,
      },
    ];
    return of(happenings);
  }
}

// Fable: swap DemoBudgetusDataSource for AssetusCalendariusDataSource when
// wired to live services. Not implemented here — this standalone budgetus
// repo prototype doesn't have the assetus/calendarius contract packages or
// live Space data available (see budgetus-source-types.ts). When wiring this
// extension into an app that has both:
//   - inject ASSET_SERVICE (@sneat/extension-assetus-contract) and call
//     `.getRenewals(spaceID)` -> map `IRenewalItem[]` to
//     `IAssetRenewalSourceItem[]`.
//   - inject Calendarius's `HappeningService` and call
//     `.watchUpcomingSingles()` (+ the recurring/yearly happenings brief) ->
//     map priced/yearly happenings to `IHappeningSourceItem[]`, setting
//     `isGift` for birthday/anniversary happenings (see budget-tab-mvp.md
//     Open Question 1 for how the recipient link should work).
// Then bind BudgetusDataSource to this class instead of DemoBudgetusDataSource
// in provide-budgetus-internal.ts.
export class AssetusCalendariusDataSource extends BudgetusDataSource {
  getAssetRenewals(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _spaceID: string,
  ): Observable<IAssetRenewalSourceItem[]> {
    throw new Error(
      'AssetusCalendariusDataSource.getAssetRenewals() is not implemented yet — ' +
        'see the "Fable: swap DemoBudgetusDataSource" comment above this class.',
    );
  }

  getUpcomingHappenings(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _spaceID: string,
  ): Observable<IHappeningSourceItem[]> {
    throw new Error(
      'AssetusCalendariusDataSource.getUpcomingHappenings() is not implemented yet — ' +
        'see the "Fable: swap DemoBudgetusDataSource" comment above this class.',
    );
  }
}

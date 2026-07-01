import { InjectionToken } from '@angular/core';
import { ISpaceContext } from '@sneat/space-models';
import { Observable } from 'rxjs';
import { IListContext } from '../contexts';
import { IBudgetOverridePatch, IBudgetRollup, ListType } from '../dto';
import {
  ICreateListRequest,
  IDeleteListItemsRequest,
  IListItemResult,
  IListItemsCommandParams,
  IReorderListItemsRequest,
  ISetListItemsIsComplete,
} from './interfaces';

// IBudgetusService is the runtime-light contract the template pages and components
// depend on. Members mirror the concrete ListService public surface used by the
// UI; the implementation lives in the internal lib and is provided via the
// BUDGETUS_SERVICE token below. The shared BaseListPage additionally needs the
// inherited ModuleSpaceItemService surface, so it types the injected token as
// an intersection with ModuleSpaceItemService<IListBrief, IListDbo>.
export interface IBudgetusService {
  createList(request: ICreateListRequest): Observable<IListContext>;
  deleteList(space: ISpaceContext, listId: string): Observable<void>;
  reorderListItems(request: IReorderListItemsRequest): Observable<void>;
  createListItems(
    params: IListItemsCommandParams,
  ): Observable<IListItemResult>;
  setListItemsIsCompleted(
    request: ISetListItemsIsComplete,
  ): Observable<void>;
  deleteListItems(request: IDeleteListItemsRequest): Observable<void>;
  getListById(
    space: ISpaceContext,
    listType: ListType,
    listID: string,
  ): Observable<IListContext>;

  // --- Budget tab (the read-model projection over renewals + happenings; see
  // budget-tab-mvp.md Section 3/4). Recomputed on every read, not a plain CRUD
  // collection — hence Observable rather than a one-shot fetch. ---

  /** Watches the derived+overridden budget rollup for a space. */
  watchBudget(spaceID: string): Observable<IBudgetRollup>;

  /**
   * Persists a user override (target amount and/or surprise-hide flag) for a
   * single computed budget line item, keyed by its `IBudgetLineItem.id`.
   * Triggers a re-emission on the `watchBudget()` observable.
   */
  setOverride(
    spaceID: string,
    lineItemId: string,
    patch: IBudgetOverridePatch,
  ): Promise<void>;
}

export const BUDGETUS_SERVICE = new InjectionToken<IBudgetusService>(
  'BudgetusService',
);

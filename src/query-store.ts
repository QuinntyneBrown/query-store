import { v4 as uuidv4 } from "uuid";
import { Observable, of, Subject } from "rxjs";
import {
  exhaustMap,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";

type AnyConstructor<A = object> = new (...args: any[]) => A;
type Action = string;
const StateChangedAction: Action = uuidv4();
const dispatcher: Subject<Action | Action[]> = new Subject();
type CacheKey = string;

export const queryStore = <T extends AnyConstructor<object>>(base: T) =>
  class extends base {
    readonly _cacheKeyObservableMap: Map<CacheKey, Observable<any> | null> =
      new Map();

    readonly _actionCacheKeysMap: Map<Action, CacheKey[]> = new Map();

    readonly _id = uuidv4();

    constructor(...args: any[]) {
      super(...args);
      dispatcher
        .pipe(
          filter((action) => this._isNullifyAction(action)),
          tap((action) => {
            let actions: Action[] = Array.isArray(action)
              ? (action as Action[])
              : [action as Action];
            this._nullifyCacheEntriesThatDependOn(actions);

            actions.forEach((a) => dispatcher.next(this._toRefreshAction(a)));
          })
        )
        .subscribe();
    }

    _nullifyCacheEntriesThatDependOn(actions: Action[]) {
      for (var i = 0; i < actions.length; i++) {
        const cacheKeys = this._actionCacheKeysMap.get(actions[i]) || [];
        for (let j = 0; j < cacheKeys.length; j++) {
          this._cacheKeyObservableMap.set(cacheKeys[j], null);
        }
      }
    }

    _toRefreshAction(action: Action): Action {
      return `${action}:${this._id}`;
    }

    _toStateChangedAction(action: Action | Action[]): Action | null {
      return Array.isArray(action) ? null : `${action}:${StateChangedAction}`;
    }

    _toActionArray(actionOrActions: Action | Action[] = []): Action[] {
      if (Array.isArray(actionOrActions) && actionOrActions.length == 0) {
        actionOrActions.push(uuidv4());
      }
      return Array.isArray(actionOrActions)
        ? actionOrActions
        : [actionOrActions];
    }

    _isRefreshAction(action: Action[] | Action): boolean {
      if (
        action &&
        action != this._toStateChangedAction(action) &&
        !Array.isArray(action) &&
        action.indexOf(this._id) > -1
      ) {
        return true;
      }
      return false;
    }

    _isNullifyAction(action: Action[] | Action): boolean {
      if (
        action &&
        action != this._toStateChangedAction(action) &&
        !this._isRefreshAction(action)
      ) {
        return true;
      }
      return false;
    }

    _anyActionsMappableTo(actions: Action[], refreshAction: Action): boolean {
      return (
        actions.map((j) => this._toRefreshAction(j)).indexOf(refreshAction) > -1
      );
    }

    from$<T>(
      observableFactory: { (): Observable<T> },
      actionOrActions: Action | Action[] = []
    ): Observable<T> {
      const actions = this._toActionArray(actionOrActions);

      const cacheKey = actions[0];

      actions.forEach((action) =>
        this._insertActionCacheKeyMapEntry(action, cacheKey)
      );

      return dispatcher.pipe(
        filter((x) => {
          if (
            this._anyActionsMappableTo(actions, x as string) &&
            this._isRefreshAction(x)
          ) {
            return true;
          }
          return false;
        }),
        startWith(true),
        exhaustMap((_) => this._from<T>(cacheKey, observableFactory))
      );
    }

    _insertActionCacheKeyMapEntry(action: Action, cacheKey: CacheKey) {
      var cacheKeys = this._actionCacheKeysMap.get(action);
      cacheKeys = cacheKeys || [];
      if (cacheKeys.filter((x) => x == cacheKey)[0] == null) {
        cacheKeys.push(cacheKey);
      }
      this._actionCacheKeysMap.set(action, cacheKeys);
    }

    _from<T>(
      cacheKey: CacheKey,
      observableFactory: { (): Observable<T> }
    ): Observable<T> {
      if (!this._cacheKeyObservableMap.get(cacheKey)) {
        const obs$ = observableFactory().pipe(
          shareReplay({ bufferSize: 1, refCount: true })
        );

        this._cacheKeyObservableMap.set(cacheKey, obs$);
      }

      dispatcher.next(this._toStateChangedAction(cacheKey) as string);

      return this._cacheKeyObservableMap.get(cacheKey) as Observable<T>;
    }

    withRefresh<T>(
      observable: Observable<T>,
      actions: Action | Action[]
    ): Observable<T> {
      return observable.pipe(tap((_) => dispatcher.next(actions)));
    }

    select<T>(cacheKey: string): Observable<T> {
      return dispatcher.pipe(
        filter((action) => action == this._toStateChangedAction(cacheKey)),
        startWith(true),
        map((_) => this._cacheKeyObservableMap.get(cacheKey)),
        switchMap((obs$) => (obs$ ? obs$ : of(null)))
      );
    }
  };

  export const QueryStore = queryStore(class { });
import { Observable } from "rxjs";
declare type AnyConstructor<A = object> = new (...args: any[]) => A;
declare type Action = string;
declare type CacheKey = string;
export declare const queryStore: <T extends AnyConstructor<object>>(base: T) => {
    new (...args: any[]): {
        readonly _cacheKeyObservableMap: Map<CacheKey, Observable<any> | null>;
        readonly _actionCacheKeysMap: Map<Action, CacheKey[]>;
        readonly _id: string;
        _nullifyCacheEntriesThatDependOn(actions: Action[]): void;
        _toRefreshAction(action: Action): Action;
        _toStateChangedAction(action: Action | Action[]): Action | null;
        _toActionArray(actionOrActions?: Action | Action[]): Action[];
        _isRefreshAction(action: Action[] | Action): boolean;
        _isNullifyAction(action: Action[] | Action): boolean;
        _anyActionsMappableTo(actions: Action[], refreshAction: Action): boolean;
        from$(observableFactory: {
            (): Observable<any>;
        }, actionOrActions?: Action | Action[]): Observable<any>;
        _insertActionCacheKeyMapEntry(action: Action, cacheKey: CacheKey): void;
        _from(cacheKey: CacheKey, observableFactory: {
            (): Observable<any>;
        }): Observable<any>;
        withRefresh(observable: Observable<any>, actions: Action | Action[]): Observable<T>;
        select(cacheKey: string): Observable<any>;
    };
} & T;
export declare const QueryStore: {
    new (...args: any[]): {
        readonly _cacheKeyObservableMap: Map<CacheKey, Observable<any> | null>;
        readonly _actionCacheKeysMap: Map<Action, CacheKey[]>;
        readonly _id: string;
        _nullifyCacheEntriesThatDependOn(actions: Action[]): void;
        _toRefreshAction(action: Action): Action;
        _toStateChangedAction(action: Action | Action[]): Action | null;
        _toActionArray(actionOrActions?: Action | Action[]): Action[];
        _isRefreshAction(action: Action[] | Action): boolean;
        _isNullifyAction(action: Action[] | Action): boolean;
        _anyActionsMappableTo(actions: Action[], refreshAction: Action): boolean;
        from$(observableFactory: {
            (): Observable<any>;
        }, actionOrActions?: Action | Action[]): Observable<any>;
        _insertActionCacheKeyMapEntry(action: Action, cacheKey: CacheKey): void;
        _from(cacheKey: CacheKey, observableFactory: {
            (): Observable<any>;
        }): Observable<any>;
        withRefresh(observable: Observable<any>, actions: Action | Action[]): Observable<{
            new (): {};
        }>;
        select(cacheKey: string): Observable<any>;
    };
} & {
    new (): {};
};
export {};

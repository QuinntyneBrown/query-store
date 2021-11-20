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
        from$<T_1>(observableFactory: () => Observable<T_1>, actionOrActions?: Action | Action[]): Observable<T_1>;
        _insertActionCacheKeyMapEntry(action: Action, cacheKey: CacheKey): void;
        _from<T_2>(cacheKey: CacheKey, observableFactory: () => Observable<T_2>): Observable<T_2>;
        withRefresh<T_3>(observable: Observable<T_3>, actions: Action | Action[]): Observable<T_3>;
        select<T_4>(cacheKey: string): Observable<T_4>;
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
        from$<T>(observableFactory: () => Observable<T_1>, actionOrActions?: Action | Action[]): Observable<T>;
        _insertActionCacheKeyMapEntry(action: Action, cacheKey: CacheKey): void;
        _from<T_1>(cacheKey: CacheKey, observableFactory: () => Observable<T_2>): Observable<T_1>;
        withRefresh<T_2>(observable: Observable<T_2>, actions: Action | Action[]): Observable<T_2>;
        select<T_3>(cacheKey: string): Observable<T_3>;
    };
} & {
    new (): {};
};
export {};

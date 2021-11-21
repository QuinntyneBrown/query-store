Object.defineProperty(exports, "__esModule", { value: true });
exports.queryStore = exports.guid = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
exports.guid = guid;
const StateChangedAction = guid();
const dispatcher = new rxjs_1.Subject();
const queryStore = (base) => class extends base {
    constructor(...args) {
        super(...args);
        this._cacheKeyObservableMap = new Map();
        this._actionCacheKeysMap = new Map();
        this._id = guid();
        dispatcher
            .pipe(operators_1.filter(action => this._isNullifyAction(action)), operators_1.tap(action => {
            let actions = Array.isArray(action) ? action : [action];
            this._nullifyCacheEntriesThatDependOn(actions);
            actions.forEach(a => dispatcher.next(this._toRefreshAction(a)));
        }))
            .subscribe();
    }
    _nullifyCacheEntriesThatDependOn(actions) {
        for (var i = 0; i < actions.length; i++) {
            const cacheKeys = this._actionCacheKeysMap.get(actions[i]) || [];
            for (let j = 0; j < cacheKeys.length; j++) {
                this._cacheKeyObservableMap.set(cacheKeys[j], null);
            }
        }
    }
    _toRefreshAction(action) {
        return `${action}:${this._id}`;
    }
    _toStateChangedAction(action) {
        return Array.isArray(action) ? null : `${action}:${StateChangedAction}`;
    }
    _toActionArray(actionOrActions = []) {
        if (Array.isArray(actionOrActions) && actionOrActions.length == 0) {
            actionOrActions.push(guid());
        }
        return Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions];
    }
    _isRefreshAction(action) {
        return action && action != this._toStateChangedAction(action) && !Array.isArray(action) && action.indexOf(this._id) > -1;
    }
    _isNullifyAction(action) {
        return action && action != this._toStateChangedAction(action) && !this._isRefreshAction(action);
    }
    _anyActionsMappableTo(actions, refreshAction) {
        return actions.map(j => this._toRefreshAction(j)).indexOf(refreshAction) > -1;
    }
    from$(observableFactory, actionOrActions = []) {
        const actions = this._toActionArray(actionOrActions);
        const cacheKey = actions[0];
        actions.forEach(action => this._insertActionCacheKeyMapEntry(action, cacheKey));
        return dispatcher.pipe(operators_1.filter((action) => this._isRefreshAction(action)), operators_1.filter((action) => this._anyActionsMappableTo(actions, action)), operators_1.startWith(true), operators_1.exhaustMap(_ => this._from(cacheKey, observableFactory)));
    }
    _insertActionCacheKeyMapEntry(action, cacheKey) {
        var cacheKeys = this._actionCacheKeysMap.get(action);
        cacheKeys = cacheKeys || [];
        if (cacheKeys.filter(x => x == cacheKey)[0] == null) {
            cacheKeys.push(cacheKey);
        }
        this._actionCacheKeysMap.set(action, cacheKeys);
    }
    _from(cacheKey, observableFactory) {
        if (!this._cacheKeyObservableMap.get(cacheKey)) {
            const obs$ = observableFactory().pipe(operators_1.shareReplay({ bufferSize: 1, refCount: true }));
            this._cacheKeyObservableMap.set(cacheKey, obs$);
        }
        dispatcher.next(this._toStateChangedAction(cacheKey));
        return this._cacheKeyObservableMap.get(cacheKey);
    }
    withRefresh(observable, actions) {
        return observable.pipe(operators_1.tap(_ => dispatcher.next(actions)));
    }
    select(cacheKey) {
        return dispatcher
            .pipe(operators_1.filter(action => action == this._toStateChangedAction(cacheKey)), operators_1.startWith(true), operators_1.map(_ => this._cacheKeyObservableMap.get(cacheKey)), operators_1.switchMap(obs$ => obs$ ? obs$ : rxjs_1.of(null)));
    }
};
exports.queryStore = queryStore;
//# sourceMappingURL=query-store.js.map
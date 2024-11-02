import isCallable = require("is-callable");

export type ValueOf<T> = T[keyof T];

export type MaybeTransformer<T, Args extends any[] = []> = T | ((...args: Args) => T);
export type MaybeTransformerRecord<T, Args extends any[] = []> = {
    [K in keyof T]: MaybeTransformer<T[K], Args>
};

export type MaybePromise<T> = T | Promise<T>;

export type TAndOthers<T, K extends keyof any = PropertyKey> = Record<K, any> & T;

export type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ValueCondition<T> = ({_isCondition: true} & Partial<{
    include: T | ((v: T) => boolean) | (T | ((v: T) => boolean) | false)[];
    exclude: T | ((v: T) => boolean) | (T | ((v: T) => boolean) | false)[];
    match: (a: T, b: T) => boolean;
}>) | T | ((v: T) => boolean) | (ValueCondition<T> | false)[];
export type OptionalValueCondition<T> = ValueCondition<T> | null;
export function valueConditionMatches<T>(value: T, condition: OptionalValueCondition<T>): boolean {
    if (condition === null) return true;
    if (Array.isArray(condition)) return condition.some(c => c !== false && valueConditionMatches(value, c));
    if (isCallable(condition)) return condition(value);

    // If the condition value here is not a condition object, it must be of type T, so we can directly compare it
    if ((condition as any)._isCondition !== true) return Object.is(value, condition);

    let { include=[], exclude=[], match=Object.is } = condition as Exclude<typeof condition, T>;

    if (!Array.isArray(include)) include = [include];
    if (!Array.isArray(exclude)) exclude = [exclude];

    const included = (v: T) => {
        return include.some(i => i !== false && (isCallable(i) ? i(v) : match(value, i)));
    };

    const excluded = (v: T) => {
        return exclude.some(e => e !== false && (isCallable(e) ? e(v) : match(value, e)));
    };

    // If there are no includes, the last condition will unexpectedly fail, so we add a separate case for this
    if (include.length === 0) return !excluded(value);
    return included(value) && !excluded(value);
}
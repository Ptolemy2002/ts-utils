import isCallable = require("is-callable");

export type ValueOf<T> = T[keyof T];

export type MaybeTransformer<T, Args extends any[] = []> = T | ((...args: Args) => T);
export type MaybeTransformerRecord<T, Args extends any[] = []> = {
    [K in keyof T]: MaybeTransformer<T[K], Args>
};

export type MaybePromise<T> = T | Promise<T>;

export type TAndOthers<T, K extends keyof any = PropertyKey> = Record<K, any> & T;

export type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
export type KeysNotMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? never : K}[keyof T];

export type EqualTypes<T, U, Y=unknown, N=never> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? Y : N;

export type KeysMatchingEqualTypes<T, V> = {[K in keyof T]-?: EqualTypes<T[K], V, K>}[keyof T];
export type KeysNotMatchingEqualTypes<T, V> = {[K in keyof T]-?: EqualTypes<T[K], V, never, K>}[keyof T];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];


export type AdvancedConditionConstructorArgs<T> = {
    include?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean) | false)[],
    exclude?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean | false))[],
    match?: (a: T, b: T) => boolean
};
export class AdvancedCondition<T> {
    // This private member allows us to disallow literal objects to be recognized as
    // matching this type.
    private declare kind: "Condition";

    include: AdvancedConditionConstructorArgs<T>["include"];
    exclude: AdvancedConditionConstructorArgs<T>["exclude"];
    match?: AdvancedConditionConstructorArgs<T>["match"];

    constructor({include=[], exclude=[], match= Object.is}: AdvancedConditionConstructorArgs<T> = {}) {
        this.include = include;
        this.exclude = exclude;
        this.match = match;
    }

    static isCondition<T>(value: any): value is AdvancedCondition<T> {
        return value instanceof AdvancedCondition;
    }
}

export type ValueCondition<T> = AdvancedCondition<T> | T | ((v: T) => boolean) | (ValueCondition<T> | false)[];
export type OptionalValueCondition<T> = ValueCondition<T> | null;
export function valueConditionMatches<T>(value: T, condition: OptionalValueCondition<T>): boolean {
    if (condition === null) return true;
    if (Array.isArray(condition)) return condition.some(c => c !== false && valueConditionMatches(value, c));
    if (isCallable(condition)) return condition(value);

    // If the condition value here is not a condition object, it must be of type T, so we can directly compare it
    if (!AdvancedCondition.isCondition(condition)) return Object.is(value, condition);

    let { include=[], exclude=[], match=Object.is } = condition;

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
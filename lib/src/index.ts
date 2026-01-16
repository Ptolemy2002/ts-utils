import isCallable = require("is-callable");
import { Branded, WithoutBrand, brand } from "@ptolemy2002/ts-brand-utils";

export type ValueOf<T> = T[keyof T];

export type MaybeTransformer<T, Args extends any[] = []> = T | ((...args: Args) => T);
export type MaybeTransformerRecord<T, Args extends any[] = []> = {
    [K in keyof T]: MaybeTransformer<T[K], Args>
};

export type MaybePromise<T> = T | Promise<T>;
export type MaybeArray<T> = T | T[];

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

export type Override<T, U> = Omit<T, keyof U> & U;

export declare const advancedConditionSymbol: unique symbol;

export type AdvancedCondition<T> = Branded<{
    // This tag functions as a runtime brand check. The "Branded" wrapper works only on compile time
    __isAdvancedCondition: true,
    include?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean))[],
    exclude?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean))[],
    match?: (a: T, b: T) => boolean
}, [typeof advancedConditionSymbol]>;

export type SerializableAdvancedCondition<T> = Branded<{
    // This tag functions as a runtime brand check. The "Branded" wrapper works only on compile time
    __isAdvancedCondition: true,
    include?: T | false | (T | false)[],
    exclude?: T | false | (T | false)[]
}, [typeof advancedConditionSymbol]>;

export function isAdvancedCondition(value: any): value is AdvancedCondition<any> {
    return (
        typeof value === "object" &&
        value !== null &&
        "__isAdvancedCondition" in value && value.__isAdvancedCondition === true
    );
}

export function createAdvancedCondition<T>(
    condition: WithoutBrand<Omit<AdvancedCondition<T>, "__isAdvancedCondition">>
): AdvancedCondition<T> {
    return {
        __isAdvancedCondition: true,
        include: [],
        exclude: [],
        match: Object.is,
        ...brand<[typeof advancedConditionSymbol], typeof condition>(condition)
    };
}

export function createSerializableAdvancedCondition<T>(
    condition: WithoutBrand<Omit<SerializableAdvancedCondition<T>, "__isAdvancedCondition">>
): SerializableAdvancedCondition<T> {
    return {
        __isAdvancedCondition: true,
        include: [],
        exclude: [],
        ...brand<[typeof advancedConditionSymbol], typeof condition>(condition)
    };
}

export type ValueCondition<T> = AdvancedCondition<T> | T | ((v: T) => boolean) | (ValueCondition<T> | false)[];
export type OptionalValueCondition<T> = ValueCondition<T> | null;
export type SerializableValueCondition<T> = SerializableAdvancedCondition<T> | T | (SerializableValueCondition<T> | false)[];
export type OptionalSerializableValueCondition<T> = SerializableValueCondition<T> | null;

export function valueConditionMatches<T>(value: T, condition: OptionalValueCondition<T>): boolean {
    if (condition === null) return true;
    if (Array.isArray(condition)) return condition.some(c => c !== false && valueConditionMatches(value, c));
    if (isCallable(condition)) return condition(value);

    // If the condition value here is not a condition object, it must be of type T, so we can directly compare it
    if (!isAdvancedCondition(condition)) return Object.is(value, condition);

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

export type ValueConditionType = "advanced" | "function" | "value" | (ValueConditionType | "false")[];
export type SerializableValueConditionType = "advanced" | "value" | (SerializableValueConditionType | "false")[];

export function valueConditionType<T>(condition: ValueCondition<T>): ValueConditionType {
    // Type assertion here because TS cannot infer that the filter will remove all false values
    if (Array.isArray(condition)) return condition.map(c => c === false ? "false" : valueConditionType(c));
    if (isAdvancedCondition(condition)) return "advanced";
    if (isCallable(condition)) return "function";
    return "value";
}

export function serializableValueConditionType<T>(condition: SerializableValueCondition<T>): SerializableValueConditionType {
    // Type assertion here because TS cannot infer that the filter will remove all false values
    if (Array.isArray(condition)) return condition.map(c => c === false ? "false" : serializableValueConditionType(c));
    if (isAdvancedCondition(condition)) return "advanced";
    return "value";
}

export type Rename<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] }

export type ValuesIntersection<T> = ValueOf<{
    // Convert each key to a function
    [K in keyof T]: (x: T[K]) => void;

    // We now have a union of all these functions
    // We can now get the parameter type of this union
    // to get the union of all the values
}> extends (x: infer I) => void ? I : never;

export type Contains<L extends unknown[], T> =
    // Any number of other elements folowed by T
    L extends [...unknown[], T] ?
        true
    // T followed by any number of other elements
    : L extends [T, ...unknown[]] ?
        true
    // T is the only element
    : L extends [T] ?
        true
    // T is not in the list 
    : false
;

export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    const _ = { ...obj }
    keys.forEach((key) => delete _[key])
    return _
}
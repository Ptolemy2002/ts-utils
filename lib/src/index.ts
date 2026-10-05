import isCallable from "is-callable";
import { Branded, WithoutBrand, brand } from "@ptolemy2002/ts-brand-utils";
import { zodFunctionSchema } from "@ptolemy2002/zod-utils";
import z, { ZodType } from "zod";

export type ValueOf<T> = T[keyof T];

export type MaybeTransformer<T, Args extends any[] = []> = T | ((...args: Args) => T);
export type MaybeTransformerRecord<T, Args extends any[] = []> = {
    [K in keyof T]: MaybeTransformer<T[K], Args>
};

export type MaybePromise<T> = T | Promise<T>;
export type MaybeArray<T> = T | T[];

export type TAndOthers<T, K extends keyof any = PropertyKey> = Record<K, any> & T;

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
export type KeysNotMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? never : K }[keyof T];

export type EqualTypes<T, U, Y = unknown, N = never> =
    (<G>() => G extends T ? 1 : 2) extends
    (<G>() => G extends U ? 1 : 2) ? Y : N;

export type KeysMatchingEqualTypes<T, V> = { [K in keyof T]-?: EqualTypes<T[K], V, K> }[keyof T];
export type KeysNotMatchingEqualTypes<T, V> = { [K in keyof T]-?: EqualTypes<T[K], V, never, K> }[keyof T];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

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

    let { include = [], exclude = [], match = Object.is } = condition;

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

export function zodAdvancedConditionSchemaTemplate<T>(
    zt: ZodType<T>, sample1: T, sample2: T
): ZodType<AdvancedCondition<T>> {
    const validatorFunctionSchema = zodFunctionSchema({
        input: z.tuple([zt]),
        output: z.boolean(),
        trials: [
            {
                input: [sample1],
                outputSchema: z.boolean(),
                error: "forbid"
            }
        ]
    });

    // Options are ordered to mirror the checks in valueConditionMatches,
    // since z.union returns the first option that succeeds.
    const validatorItemSchema = z.union([z.literal(false), validatorFunctionSchema, zt]);
    const validatorUnionSchema = z.union([z.array(validatorItemSchema), validatorItemSchema]);

    // Strict and requiring at least one key so that arbitrary objects are not interpreted
    // as an empty (match-all) condition.
    // The tag is accepted but not required, as the transform always injects it.
    return z.strictObject({
        __isAdvancedCondition: z.literal(true).optional(),
        include: validatorUnionSchema.optional(),
        exclude: validatorUnionSchema.optional(),

        match: zodFunctionSchema({
            input: z.tuple([zt, zt]),
            output: z.boolean(),
            trials: [
                {
                    id: "matches_same_object",
                    input: [sample1, sample1],
                    outputSchema: z.literal(true),
                    error: "forbid"
                },

                // Requires sample1 and sample2 to be values that no reasonable
                // match function would consider equal
                {
                    id: "does_not_match_different_objects",
                    input: [sample1, sample2],
                    outputSchema: z.literal(false),
                    error: "forbid"
                }
            ]
        }).optional()
    }).refine(
        (data) => data.include !== undefined || data.exclude !== undefined || data.match !== undefined,
        { message: "At least one of include, exclude, or match must be specified" }
    ).transform(
        ({ __isAdvancedCondition, ...data }) => createAdvancedCondition(data)
    );
}

export function zodSerializableAdvancedConditionSchemaTemplate<T>(
    zt: ZodType<T>
): ZodType<SerializableAdvancedCondition<T>> {
    const valueItemSchema = z.union([z.literal(false), zt]);
    const valueUnionSchema = z.union([z.array(valueItemSchema), valueItemSchema]);

    // Strict, so a "match" key (or any other unknown key) is rejected
    return z.strictObject({
        __isAdvancedCondition: z.literal(true).optional(),
        include: valueUnionSchema.optional(),
        exclude: valueUnionSchema.optional()
    }).refine(
        (data) => data.include !== undefined || data.exclude !== undefined,
        { message: "At least one of include or exclude must be specified" }
    ).transform(
        ({ __isAdvancedCondition, ...data }) => createSerializableAdvancedCondition<T>(data)
    );
}

export function zodValueConditionSchemaTemplate<T>(zt: ZodType<T>, sample1: T, sample2: T): ZodType<ValueCondition<T>> {
    // Options are ordered to mirror the checks in valueConditionMatches,
    // since z.union returns the first option that succeeds.
    const schema: ZodType<ValueCondition<T>> = z.union([
        z.array(
            z.union([z.literal(false),
            // This lazy evaluation is what allows recursion
            z.lazy(() => schema)])
        ),

        zodFunctionSchema({
            input: z.tuple([zt]),
            output: z.boolean(),
            trials: [
                {
                    input: [sample1],
                    outputSchema: z.boolean()
                }
            ]
        }),

        zodAdvancedConditionSchemaTemplate(zt, sample1, sample2),
        zt
    ]);

    return schema;
}

export function zodSerializableValueConditionSchemaTemplate<T>(zt: ZodType<T>): ZodType<SerializableValueCondition<T>> {
    // Essentially same as above, but with no function option and deferring to the serializable advanced condition schema template
    // instead of the regular advanced condition schema template
    const schema: ZodType<SerializableValueCondition<T>> = z.union([
        z.array(
            z.union([z.literal(false),
            // This lazy evaluation is what allows recursion
            z.lazy(() => schema)])
        ),

        zodSerializableAdvancedConditionSchemaTemplate(zt),
        zt
    ]);

    return schema;
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

export type ArrayWithOptional<AR extends unknown[], AO extends unknown[]> = AR | [...AR, ...AO];

export abstract class Collection<T> {
    abstract get length(): number;
    abstract at(index: number): T | undefined;
    abstract find(predicate: (item: T, index: number, array: Collection<T>) => boolean): T | undefined;
    abstract findIndex(predicate: (item: T, index: number, array: Collection<T>) => boolean): number;
    abstract indexOf(item: T, fromIndex?: number): number;
    abstract includes(item: T, fromIndex?: number): boolean;
    abstract some(predicate: (item: T, index: number, array: Collection<T>) => boolean): boolean;
    abstract every(predicate: (item: T, index: number, array: Collection<T>) => boolean): boolean;
    abstract forEach(callback: (item: T, index: number, array: Collection<T>) => void): void;
    abstract map<U>(callback: (item: T, index: number, array: Collection<T>) => U): U[];
    abstract filter(predicate: (item: T, index: number, array: Collection<T>) => boolean): Collection<T>;
    abstract flat(depth?: number): Collection<T>;
    abstract flatMap<U>(callback: (item: T, index: number, array: Collection<T>) => U | U[], depth?: number): U[];
    abstract slice(start?: number, end?: number): Collection<T>;
    abstract concat(...others: (T | T[] | Collection<T>)[]): Collection<T>;
    abstract push(...items: T[]): void;
    abstract pop(): T | undefined;
    abstract shift(): T | undefined;
    abstract unshift(...items: T[]): number;
    abstract splice(start: number, deleteCount?: number, ...items: T[]): Collection<T>;
    abstract reverse(): Collection<T>;
    abstract sort(compareFn?: (a: T, b: T) => number): Collection<T>;
    abstract fill(value: T, start?: number, end?: number): Collection<T>;
    abstract [Symbol.iterator](): Iterator<T>;
    abstract entries(): IterableIterator<[number, T]>;
    abstract keys(): IterableIterator<number>;
    abstract values(): IterableIterator<T>;

    abstract reduce<U>(accumulator: U, callback: (accumulator: U, item: T, index: number, array: Collection<T>) => U): U;
    abstract reduce(callback: (accumulator: T, item: T, index: number, array: Collection<T>) => T): T;
    abstract reduce<U>(callback: (accumulator: U | T, item: T, index: number, array: Collection<T>) => U | T, initialValue?: U): U | T;

    abstract toArray(): T[];
}
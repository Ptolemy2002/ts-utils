import {
    ValueOf, MaybeTransformer, MaybeTransformerRecord, MaybePromise, TAndOthers,
    Rename, valueConditionMatches, AtLeastOne,
    ValuesIntersection,
    createAdvancedCondition,
    ValueCondition,
    SerializableValueCondition,
    ArrayWithOptional, zodSerializableValueConditionSchemaTemplate,
    zodSerializableAdvancedConditionSchemaTemplate,
    SerializableAdvancedCondition,
    zodAdvancedConditionSchemaTemplate,
    zodValueConditionSchemaTemplate,
    AdvancedCondition,
    isAdvancedCondition
} from '@ptolemy2002/ts-utils';
import z from 'zod';

type Test = {
    a: number;
    b: string;
    c: boolean;
};

const testValue1: ValueOf<Test> = 1;
const testValue2: ValueOf<Test> = '2';
const testValue3: ValueOf<Test> = true;

const testTransformer1: MaybeTransformer<number, [string]> = 1;
const testTransformer2: MaybeTransformer<number, [string]> = (s: string) => s.length;

type TestRecord = MaybeTransformerRecord<Test, [string]>;
const testRecord: TestRecord = {
    a: 1,
    b: (s: string) => s + '2',
    c: true
};

type TestPromise = MaybePromise<number>;
const testPromise1: TestPromise = 1;
const testPromise2: TestPromise = Promise.resolve(2);

type TestAndOthers = TAndOthers<Test, string>;
const testAndOthers: TestAndOthers = {
    a: 1,
    b: '2',
    c: true,

    d: 4
};

type TestRename = Rename<Test, 'a', 'x'>;
const testRename: TestRename = {
    x: 1,
    b: '2',
    c: true
};

type Test1 = {
    a: {
        x: number;
        y: string;
    },
    b: {
        z: boolean;
    }
};

type ValuesIntersectionTest = ValuesIntersection<Test1>;

type AtLeastOneTest = AtLeastOne<Test>;
const atLeastOneTest1: AtLeastOneTest = { a: 1 };
const atLeastOneTest2: AtLeastOneTest = { b: '2' };
const atLeastOneTest3: AtLeastOneTest = { c: true };
const atLeastOneTest4: AtLeastOneTest = { a: 1, b: '2' };
const atLeastOneTest5: AtLeastOneTest = { a: 1, c: true };
const atLeastOneTest6: AtLeastOneTest = { b: '2', c: true };
const atLeastOneTest7: AtLeastOneTest = { a: 1, b: '2', c: true };

type ArrayWithOptionalTest = ArrayWithOptional<[number, string], ArrayWithOptional<[boolean], [Date]>>;
const arrayWithOptionalTest1: ArrayWithOptionalTest = [1, '2'];
const arrayWithOptionalTest2: ArrayWithOptionalTest = [1, '2', true];
const arrayWithOptionalTest3: ArrayWithOptionalTest = [1, '2', false, new Date()];

type C1 = ValueCondition<number>;
type C2 = SerializableValueCondition<number>;
type ShouldBeTrue = C2 extends C1 ? true : false;

const testValueCondition1 = valueConditionMatches(1, 1);
const testValueCondition2 = valueConditionMatches(1, [1, 2]);
const testValueCondition3 = valueConditionMatches(1, createAdvancedCondition({ include: [1], exclude: [2] }));
const testValueCondition4 = valueConditionMatches(2, createAdvancedCondition({ include: [1], exclude: [2] }));
const testValueCondition5 = valueConditionMatches(2, createAdvancedCondition({ match: (a, b) => a === b }));
const testValueCondition6 = valueConditionMatches(2, (v: number) => v === 2);
const testValueCondition7 = valueConditionMatches(2, null);
const testValueCondition8 = valueConditionMatches(2, createAdvancedCondition<number>({ include: [false && 2]}));
const testValueCondition9 = valueConditionMatches(2, createAdvancedCondition<number>({ exclude: [false && 2]}));
const testValueCondition10 = valueConditionMatches(2, 1);

console.assert(testValueCondition1, "Test Value Condition 1");
console.assert(testValueCondition2, "Test Value Condition 2");
console.assert(testValueCondition3, "Test Value Condition 3");
console.assert(!testValueCondition4, "Test Value Condition 4");
console.assert(testValueCondition5, "Test Value Condition 5");
console.assert(testValueCondition6, "Test Value Condition 6");
console.assert(testValueCondition7, "Test Value Condition 7");
console.assert(!testValueCondition8, "Test Value Condition 8");
console.assert(testValueCondition9, "Test Value Condition 9");
console.assert(!testValueCondition10, "Test Value Condition 10");

const testAdvancedConditionSchema = zodSerializableAdvancedConditionSchemaTemplate(z.string());
const testAdvancedConditionSchemaParsed = testAdvancedConditionSchema.parse({
    include: ["test", false, "test2"],
    exclude: ["test3"]
});
const testAdvancedConditionValue: SerializableAdvancedCondition<string> = testAdvancedConditionSchemaParsed;

const testValueConditionSchema = zodSerializableValueConditionSchemaTemplate(z.string());
const testValueConditionSchemaParsed = testValueConditionSchema.parse([
    "test", false,
    {
        include: ["test2", false, "test3"],
        exclude: ["test4"]
    }
]);
const testValueConditionValue: SerializableValueCondition<string> = testValueConditionSchemaParsed;

// Serializable schemas support nested arrays and inject the tag
const testNestedSerializableParsed = testValueConditionSchema.parse(["test", [false, { exclude: "test2" }]]);
console.assert(valueConditionMatches("test3", testNestedSerializableParsed), "Serializable Schema: nested array");
console.assert(isAdvancedCondition(testAdvancedConditionSchema.parse({ include: "test" })), "Serializable Schema: tag injected");

// Serializable schemas reject functions, match, unknown keys, and conditions with no keys
console.assert(!testAdvancedConditionSchema.safeParse({ include: (v: string) => v === "test" }).success, "Serializable Schema: function rejected");
console.assert(!testAdvancedConditionSchema.safeParse({ include: "test", match: Object.is }).success, "Serializable Schema: match rejected");
console.assert(!testAdvancedConditionSchema.safeParse({ include: "test", other: 1 }).success, "Serializable Schema: unknown key rejected");
console.assert(!testAdvancedConditionSchema.safeParse({}).success, "Serializable Schema: empty object rejected");
console.assert(!testAdvancedConditionSchema.safeParse({ __isAdvancedCondition: true }).success, "Serializable Schema: tag-only object rejected");
console.assert(!testValueConditionSchema.safeParse(["test", () => true]).success, "Serializable Schema: function in array rejected");

// Non-serializable schemas take two different sample values, used to test functions during parsing
const testFullAdvancedConditionSchema = zodAdvancedConditionSchemaTemplate(z.string(), "a", "b");
const testFullAdvancedConditionParsed = testFullAdvancedConditionSchema.parse({
    include: [(v: string) => v.startsWith("test"), false],
    exclude: "test2",
    match: (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
});
const testFullAdvancedConditionValue: AdvancedCondition<string> = testFullAdvancedConditionParsed;
console.assert(valueConditionMatches("test1", testFullAdvancedConditionValue), "Advanced Schema: include function");
console.assert(!valueConditionMatches("TEST2", testFullAdvancedConditionValue), "Advanced Schema: custom match");
console.assert(!valueConditionMatches("other", testFullAdvancedConditionValue), "Advanced Schema: not included");

// match must return true for (sample1, sample1) and false for (sample1, sample2)
console.assert(!testFullAdvancedConditionSchema.safeParse({ match: () => true }).success, "Advanced Schema: bad match rejected");
console.assert(!testFullAdvancedConditionSchema.safeParse({ include: () => "yes" }).success, "Advanced Schema: non-boolean predicate rejected");
console.assert(!testFullAdvancedConditionSchema.safeParse({}).success, "Advanced Schema: empty object rejected");

const testFullValueConditionSchema = zodValueConditionSchemaTemplate(z.string(), "a", "b");
const testFullValueConditionParsed = testFullValueConditionSchema.parse([
    "test", false,
    [(v: string) => v.length > 10, { include: "test2" }]
]);
const testFullValueConditionValue: ValueCondition<string> = testFullValueConditionParsed;
console.assert(valueConditionMatches("test", testFullValueConditionValue), "Value Schema: plain value");
console.assert(valueConditionMatches("test2", testFullValueConditionValue), "Value Schema: nested advanced condition");
console.assert(valueConditionMatches("a very long string", testFullValueConditionValue), "Value Schema: nested function");
console.assert(!valueConditionMatches("other", testFullValueConditionValue), "Value Schema: no match");

// With an object T, a condition-shaped object is treated as an advanced condition, while other objects are values of T
const testObjectValueConditionSchema = zodValueConditionSchemaTemplate(z.object({ x: z.number().optional() }), { x: 1 }, { x: 2 });
console.assert(isAdvancedCondition(testObjectValueConditionSchema.parse({ include: [{ x: 1 }] })), "Value Schema: object T advanced condition");
console.assert(!isAdvancedCondition(testObjectValueConditionSchema.parse({ x: 3 })), "Value Schema: object T value");

console.log("Compiled without errors");
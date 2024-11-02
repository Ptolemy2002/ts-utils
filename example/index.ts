import {
    ValueOf, MaybeTransformer, MaybeTransformerRecord, MaybePromise, TAndOthers,
    valueConditionMatches
} from '@ptolemy2002/ts-utils';

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

const testValueCondition1 = valueConditionMatches(1, 1);
const testValueCondition2 = valueConditionMatches(1, [1, 2]);
const testValueCondition3 = valueConditionMatches(1, { _isCondition: true, include: [1], exclude: [2] });
const testValueCondition4 = valueConditionMatches(2, { _isCondition: true, include: [1], exclude: [2] });
const testValueCondition5 = valueConditionMatches(2, { _isCondition: true, match: (a, b) => a === b });
const testValueCondition6 = valueConditionMatches(2, (v: number) => v === 2);
const testValueCondition7 = valueConditionMatches(2, null);
const testValueCondition8 = valueConditionMatches(2, { _isCondition: true, include: [false && 2]});
const testValueCondition9 = valueConditionMatches(2, { _isCondition: true, exclude: [false && 2]});
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

console.log("Compiled without errors");
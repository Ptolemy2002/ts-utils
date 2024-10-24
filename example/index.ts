import {
    ValueOf, MaybeTransformer, MaybeTransformerRecord, MaybePromise, TAndOthers
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

console.log("Compiled without errors");
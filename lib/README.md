# Typescript Utils
This library contains a collection of utility types and functions for use in Typescript projects.

The types and functions are not exported as default, so you can import them in one of the following ways:
```javascript
// ES6
import { functionName } from '@ptolemy2002/ts-utils';
// CommonJS
const { functionName } = require('@ptolemy2002/ts-utils');
```

## Type Reference
```typescript
import { Branded, WithoutBrand } from "@ptolemy2002/ts-brand-utils";
```

## Types
The following types are available in the library:

### ValueOf<T>
This type returns a union of every possible value in an object of type `T`.

### MaybeTransformer<T, Args extends any[] = []>
Given a type `T`, this type returns a union of that type itself and a function that takes the specified arguments and returns the type `T`.

### MaybeTransformerRecord<T, Args extends any[] = []>
Given a type `T`, this type loops through every key `K` and wraps that key's value in a `MaybeTransformer` with the specified arguments.

### MaybePromise<T>
This type returns a union of the type `T` and a promise that resolves to the type `T`.

### MaybeArray<T>
This type returns a union of the type `T` and an array of that type.

### TAndOthers<T, K extends keyof any = PropertyKey>
This type returns an object with all the properties of `T` and any number of other properties under keys that fit the type `K`. The additional properties will all have the type `any` because I couldn't figure out how to make them have a type that does not include `ValueOf<T>` due to the way Typescript handles mapped object types.

### KeysMatching<T, V>
This type returns a union of all the keys in `T` that have a value assignable to `V`.

### PartialBy<T, K extends keyof T>
This type returns a type that is the same as `T` except that the keys in `K` are optional.

### AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }>
This type returns a type that is the same as `T` except that at least one key is required.

### Override<T, U>
This type returns a type that is the same as `T` except that the keys in `U` are overridden with the values in `U`.

### Rename<T, K extends keyof T, N extends string>
This type returns a type that is the same as `T` except that the key `K` is renamed to `N`.


### ValueCondition<T>
This type allows the user to specify a condition for matching a subset of type `T`. It can be one of the following:
- A value of type `T`
- An instance of `AdvancedCondition<T>`
- An array of objects of type `T | ValueCondition<T> | false`.
- A function that takes a value of type `T` and returns a boolean.

The condition can then be passed to the `valueConditionMatches` function along with a value of type `T` to determine if the condition is met for that value.

### OptionalValueCondition<T>
This type is the same as `ValueCondition<T>` except that the value can also be `null`, indicating any value is acceptable.

### AdvancedCondition<T>
```typescript
declare const advancedConditionSymbol: unique symbol;

type AdvancedCondition<T> = Branded<{
    __isAdvancedCondition: true,
    include?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean) | false)[],
    exclude?: T | false | ((v: T) => boolean) | (T | false | ((v: T) => boolean | false))[],
    match?: (a: T, b: T) => boolean
}, [typeof advancedConditionSymbol]>;
```

### ValuesIntersection<T>
This type returns an intersection of all the possible values in an object of type `T`.

### Contains<L extends unknown[], T>
This type returns a boolean indicating whether the type `T` is contained in the array `L`.

## Functions
The following functions are available in the library:

### isAdvancedCondition
#### Description
This function takes a value of any type and returns a boolean indicating whether the value is an instance of `AdvancedCondition` by checking for the `__isAdvancedCondition` property and ensuring it is `true`.

#### Parameters
- `value` (`any`) - The value to check.

#### Returns
`value is AdvancedCondition<any>` - Boolean determining whether the value is an instance of `AdvancedCondition`. It functions as a type guard in Typescript.

### createAdvancedCondition<T>
#### Description
This function creates an instance of `AdvancedCondition` with the specified arguments and sensible defaults applied.

#### Parameters
- `condition` (`WithoutBrand<Omit<AdvancedCondition<T>, "__isAdvancedCondition">>`) - The arguments to use in constructing the condition.
    - `include` - The value or values that must be included in the condition. If this is a function, it will be used to determine if a value should be included. If this is `false`, it will be ignored.
    - `exclude` - The value or values that must be excluded from the condition. If this is a function, it will be used to determine if a value should be excluded. If this is `false`, it will be ignored.
    - `match` - The function used to determine if two values are equal. If this is not specified, it will default to `Object.is`.

#### Returns
`AdvancedCondition<T>` - The advanced condition instance.

### valueConditionMatches<T>
#### Description
This function takes a value of type `T` and a condition of type `OptionalValueCondition<T>` and returns a boolean indicating whether the value meets the condition. If the condition is `null`, the function will always return `true`. Any instance of the value `false` will be filtered out of lists. If `match` is not specified, it will default to `Object.is`. If `include` is not specified or empty, it will be ignored and `exclude` will act as the only constraint. If `exclude` is not specified, it will be assumed to be empty.

#### Parameters
- `value` (`T`) - The value to check against the condition.
- `condition` (`OptionalValueCondition<T>`) - The condition to check against the value.

#### Returns
`boolean` - Whether the value meets the condition.

### omit<T, K extends keyof T>
#### Description
This function takes an object of type `T` and a list of keys `K` and returns a new object with all the keys in `K` removed.

#### Parameters
- `object` (`T`) - The object to omit keys from.
- `keys` (`K[]`) - The keys to omit from the object.

#### Returns
`Omit<T, K>` - The object with the keys omitted.

## Peer Dependencies
- `is-callable^1.2.7`
- `@ptolemy2002/ts-brand-utils^1.0.0`

## Commands
The following commands exist in the project:

- `npm run uninstall` - Uninstalls all dependencies for the library
- `npm run reinstall` - Uninstalls and then Reinstalls all dependencies for the library
- `npm run example-uninstall` - Uninstalls all dependencies for the example app
- `npm run example-install` - Installs all dependencies for the example app
- `npm run example-reinstall` - Uninstalls and then Reinstalls all dependencies for the example app
- `npm run example-start` - Starts the example app after building the library
- `npm run build` - Builds the library
- `npm run release` - Publishes the library to npm without changing the version
- `npm run release-patch` - Publishes the library to npm with a patch version bump
- `npm run release-minor` - Publishes the library to npm with a minor version bump
- `npm run release-major` - Publishes the library to npm with a major version bump
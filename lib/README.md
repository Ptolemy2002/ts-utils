# Typescript Utils
This library contains a collection of utility types and functions for use in Typescript projects.

The types and functions are not exported as default, so you can import them in one of the following ways:
```javascript
// ES6
import { functionName } from '@ptolemy2002/ts-utils';
// CommonJS
const { functionName } = require('@ptolemy2002/ts-utils');
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

### TAndOthers<T, K extends keyof any = PropertyKey>
This type returns an object with all the properties of `T` and any number of other properties under keys that fit the type `K`. The additional properties will all have the type `any` because I couldn't figure out how to make them have a type that does not include `ValueOf<T>` due to the way Typescript handles mapped object types.

### KeysMatching<T, V>
This type returns a union of all the keys in `T` that have a value assignable to `V`.

### PartialBy<T, K extends keyof T>
This type returns a type that is the same as `T` except that the keys in `K` are optional.

### ValueCondition<T>
This type allows the user to specify a condition for matching a subset of type `T`. It can be one of the following:
- A value of type `T`
- An object with keys `include` and `exclude` that are both either objects of type `T`, functions that take a value of `T` and return a boolean, or arrays of objects of any of the preceding types or `false`. In addition, there is a `match` key that takes 2 values of type `T` and returns a boolean. Each of these keys is optional. The one required key is `_isCondition` which should be set to `true`. This allows this condition object to be distinguished from a regular object of type `T`.
- An array of objects of type `T | ValueCondition<T> | false`.
- A function that takes a value of type `T` and returns a boolean.

The condition can then be passed to the `valueConditionMatches` function along with a value of type `T` to determine if the condition is met for that value.

### OptionalValueCondition<T>
This type is the same as `ValueCondition<T>` except that the value can also be `null`, indicating any value is acceptable.

## Functions
The following functions are available in the library:

### valueConditionMatches<T>
#### Description
This function takes a value of type `T` and a condition of type `OptionalValueCondition<T>` and returns a boolean indicating whether the value meets the condition. If the condition is `null`, the function will always return `true`. Any instance of the value `false` will be filtered out of lists. If `match` is not specified, it will default to `Object.is`. If `include` is not specified or empty, it will be ignored and `exclude` will act as the only constraint. If `exclude` is not specified, it will be assumed to be empty.

#### Parameters
- `value` (`T`) - The value to check against the condition.
- `condition` (`OptionalValueCondition<T>`) - The condition to check against the value.

#### Returns
- `boolean` - Whether the value meets the condition.

## Peer Dependencies
- `is-callable^1.2.7`

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
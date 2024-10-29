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

## Peer Dependencies
None

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
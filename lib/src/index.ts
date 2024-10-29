export type ValueOf<T> = T[keyof T];

export type MaybeTransformer<T, Args extends any[] = []> = T | ((...args: Args) => T);
export type MaybeTransformerRecord<T, Args extends any[] = []> = {
    [K in keyof T]: MaybeTransformer<T[K], Args>
};

export type MaybePromise<T> = T | Promise<T>;

export type TAndOthers<T, K extends keyof any = PropertyKey> = Record<K, any> & T;

export type KeysMatching<T, V> = {[K in keyof T]-?: T[K] extends V ? K : never}[keyof T];
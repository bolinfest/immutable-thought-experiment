/**
 * ImmutableList that supports a subset of the Array API.
 *
 * It is not appropriate to test an instance of this class with Array.isArray().
 */
declare class ImmutableList<T> {
  length: number; // readonly
  @@iterator(): Iterator<T>;
  indexOf(searchElement: T, fromIndex?: number): number;
  join(separator?: string): string;
  includes(searchElement: T, fromIndex?: number): boolean;
  lastIndexOf(searchElement: T, fromIndex?: number): number;
  slice(start?: number, end?: number): ImmutableList<T>;

  // Methods that take callbacks.

  every(
    callback: (value: T, index: number, array: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): boolean;
  filter(
    callback: (value: T, index: number, array: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): ImmutableList<T>;
  find(
    callback: (value: T, index: number, array: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): T;
  findIndex(
    callback: (value: T, index: number, array: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): T;
  forEach(
    callback: (value: T, index: number, self: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): void;
  map<U>(
    callback: (value: T, index: number, self: ImmutableList<T>) => U,
    thisArg?: any,
  ): ImmutableList<U>;
  some(
    callback: (value: T, index: number, array: ImmutableList<T>) => mixed,
    thisArg?: any,
  ): boolean;

  // Reducers. Note that initialValue must be specified if this list is empty.

  reduce<U>(
    callback: (previousValue: U, currentValue: T, currentIndex: number, array: ImmutableList<T>) => U,
    initialValue?: U,
  ): U;
  reduceRight<U>(
    callback: (previousValue: U, currentValue: T, currentIndex: number, array: ImmutableList<T>) => U,
    initialValue?: U,
  ): U;
}

/**
 * Builder for an ImmutableList. This can only be passed to build() once.
 *
 * Note that it has no public methods of its own: it can only be passed as
 * an argument to functions in ImmutableList.js.
 */
declare class ImmutableList$Builder<T> {};

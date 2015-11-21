'use babel';
/* @flow */

type List<T> = ImmutableList<T>;

/**
 * The idea is that this should be set to true when developing,
 * but set to false (ideally at compile time) for production.
 */
const VERIFY_INVARIANTS = true;

const SUPPORTS_FROZEN = typeof Object.isFrozen === 'function';

const EMPTY_LIST = _freeze([]);

/**
 * If you have:
 *
 *   const array = [1, 2, 3, 4];
 *
 * and you are certain that no one else has (or will have) a reference
 * to this Array such that they can mutate it, then you may want to type it
 * as an ImmutableList to avoid making a copy. This function
 * makes it so that you can do this in one line without any funny
 * Flow annotations:
 *
 *   const list = claim(array);
 *
 * Many would consider this cleaner than doing:
 *
 *   const list: ImmutableList<number> = (reference: any);
 *
 * Although claim() introduces an extra function call (which
 * is already cheap), a decent whole-program optimizing compiler should
 * be able to strip it if the output is built with VERIFY_INVARIANTS set
 * to false.
 */
export function claim<T>(array: Array<T>): List<T> {
  return (_freeze(array): any);
}

/**
 * Takes an Array and returns a corresponding ImmutableList.
 * This function tries to avoid allocating memory, if possible,
 * though it is often O(N) in the length of `array` in both time
 * and space.
 *
 * Note that this does not support an optional map function as Array.from()
 * does. This is intentional because it simplifies type-checking.
 * If you want to map an Iterable and use the results as an ImmutableList,
 * then use Array.from() to do the mapping and then pass the result
 * directly to claim().
 */
export function copyOf<T>(array: Array<T>): List<T> {
  if (array.length === 0) {
    return (EMPTY_LIST: any);
  } else if (SUPPORTS_FROZEN && Object.isFrozen(array)) {
    return (array: any);
  } else {
    return claim(array.slice());
  }
}

/**
 * Returns a new Array with the contents of the specified ImmutableList.
 */
export function toArray<T>(list: List<T>): Array<T> {
  return (list.slice(): any);
}

/**
 * Freezes the item, if appropriate.
 *
 * This function is designed so that it can be inlined by an optimizing
 * compiler if VERIFY_INVARIANTS is false.
 */
function _freeze<T>(item: T): T {
  if (VERIFY_INVARIANTS && SUPPORTS_FROZEN) {
    return Object.freeze(item);
  } else {
    return item;
  }
}

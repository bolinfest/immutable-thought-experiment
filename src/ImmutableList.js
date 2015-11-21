'use babel';
/* @flow */

type List<T> = ImmutableList<T>;
type Builder<T> = ImmutableList$Builder<T>;

/**
 * The idea is that this should be set to true when developing,
 * but set to false (ideally at compile time) for production.
 */
const VERIFY_INVARIANTS = true;

const __FROZEN_MARKER__ = '__not-mutable-FROZEN_MARKER__';

const SUPPORTS_FROZEN = typeof Object.isFrozen === 'function';

const EMPTY_LIST = (SUPPORTS_FROZEN && VERIFY_INVARIANTS) ? Object.freeze([]) : [];

/**
 * If you have:
 *
 *   const array = [1, 2, 3, 4];
 *
 * and you are certain that no one else has a reference to this
 * Array such that they can mutate it, then you may want to type it
 * as an ImmutableList to avoid making a copy. This function
 * makes it so that you can do this in one line without any funny
 * Flow annotations:
 *
 *   const list = fromLoneReference(array);
 *
 * Many would consider this cleaner than doing:
 *
 *   const list: ImmutableList<number> = (reference: any);
 *
 * Although fromLoneReference() introduces an extra function call (which
 * is already cheap), a decent whole-program optimizing compiler should
 * be able to strip it if the output is built with VERIFY_INVARIANTS set
 * to false.
 */
export function fromLoneReference<T>(array: Array<T>): List<T> {
  return ((_freeze(array): any): List<T>);
}

/**
 * Takes an Array and returns a corresponding ImmutableList.
 * This function tries to avoid allocating memory, if possible,
 * though it is often O(N) in the length of `array` in both time
 * and space.
 */
export function copyOf<T>(array: Array<T>): List<T> {
  if (array.length === 0) {
    return (EMPTY_LIST: any);
  } else if (SUPPORTS_FROZEN && Object.isFrozen(array)) {
    return (array: any);
  } else {
    return fromLoneReference(array.slice());
  }
}

export function newBuilder<T>(): Builder<T> {
  return (([]: any): Builder);
}

export function newBuilderFromImmutableList<T>(
  list: List<T>,
): Builder<T> {
  return ((list.slice(): any): Builder<T>);
}

export function add<T>(builder: Builder<T>, ...items: Array<T>) {
  _assertNotBuilt(builder);

  // It should be possible to teach a whole program optimizer
  // to inline a call like this:
  //
  //   add(builder, 'one', 'two', 'three')
  //
  // as:
  //
  //   assertNotBuilt(builder);
  //   builder.push('one', 'two', 'three');
  //
  // because the context for `push` matches the first arg to apply().
  _BuilderAsArray(builder).push.apply(builder, items);
}

export function addAll<T>(builder: Builder<T>, items: Iterable<T>) {
  _assertNotBuilt(builder);
  for (const item of items) {
    _BuilderAsArray(builder).push(item);
  }
}

export function build<T>(builder: Builder<T>): List<T> {
  _assertNotBuilt(builder);
  return ((_freeze(builder): any): List<T>);
}

function _BuilderAsArray<T>(builder: Builder<T>): Array<T> {
  return ((builder: any): Array<T>);
}

function _assertNotBuilt<T>(builder: Builder<T>): void {
  if (!VERIFY_INVARIANTS) {
    return;
  }

  let violatesInvariant;
  if (SUPPORTS_FROZEN) {
    violatesInvariant = Object.isFrozen(builder);
  } else {
    violatesInvariant = builder.hasOwnProperty(__FROZEN_MARKER__);
  }

  if (violatesInvariant) {
    throw new Error(`build() has already been invoked for ${builder}`);
  }
}

function _freeze<T>(item: T): T {
  if (!VERIFY_INVARIANTS) {
    return item;
  }

  if (SUPPORTS_FROZEN) {
    return Object.freeze(item);
  } else {
    // Add private property to symbolize frozen-ness.
    // This does not actually enforce immutability as freeze() does.
    // $FlowFixMe
    item[__FROZEN_MARKER__] = undefined;
    return item;
  }
}

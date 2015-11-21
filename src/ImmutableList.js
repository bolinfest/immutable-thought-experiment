'use babel';
/* @flow */

import type {
  ImmutableList as List,
  ImmutableList$Builder as Builder,
} from './types';

/**
 * The idea is that this should be set to true when developing,
 * but set to false (ideally at compile time) for production.
 */
const VERIFY_INVARIANTS = true;

const __FROZEN_MARKER__ = '__not-mutable-FROZEN_MARKER__';

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
  if (typeof Object.isFrozen === 'function') {
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

  if (typeof Object.freeze === 'function') {
    return Object.freeze(item);
  } else {
    // Add private property to symbolize frozen-ness.
    // This does not actually enforce immutability as freeze() does.
    // $FlowFixMe
    item[__FROZEN_MARKER__] = undefined;
    return item;
  }
}

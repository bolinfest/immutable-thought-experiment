'use babel';
/* @flow */

import {
  copyOf,
  fromLoneReference,
} from '../src/ImmutableList';

import {
  add,
  addAll,
  build,
  newBuilder,
  newBuilderFromImmutableList,
} from '../src/ImmutableList$Builder';

describe('ImmutableList$Builder', () => {
  it('Empty ImmutableList via newBuilder()', () => {
    const builder = newBuilder();
    const list = build(builder);
    expect(list.length).toBe(0);
  });

  it('Build up ImmutableList using add()', () => {
    const builder = newBuilder();
    add(builder, 'one');
    add(builder, 'two');
    add(builder, 'three');
    const list = build(builder);
    expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
  });

  it('Build up ImmutableList using var-arg add()', () => {
    const builder = newBuilder();
    add(builder, 'one', 'two', 'three');
    const list = build(builder);
    expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
  });

  it('Build up ImmutableList using addAll()', () => {
    const builder = newBuilder();
    addAll(builder, ['one', 'two', 'three']);
    const list = build(builder);
    expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
  });
});

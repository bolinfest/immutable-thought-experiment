'use babel';
/* @flow */

import {
  add,
  addAll,
  build,
  fromLoneReference,
  newBuilder,
  newBuilderFromImmutableList,
} from '../src/ImmutableList';

describe('ImmutableList.Builder', () => {
  it('type cast ImmutableList', () => {
    const array = ['one', 'two', 'three'];
    const list: ImmutableList<string> = (array: any);
    expect(list).toEqual(['one', 'two', 'three']);
  });

  it('Use fromLoneReference() to type cast ImmutableList', () => {
    const array = ['one', 'two', 'three'];
    const list = fromLoneReference(array);
    expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
  });

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

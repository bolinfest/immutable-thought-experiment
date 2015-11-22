'use babel';
/* @flow */

import {ImmutableList as List} from '../src/main';
const {
  claim,
  copyOf,
  toArray,
} = List;

describe('ImmutableList', () => {
  describe('claim()', () => {
    it('effectily used to type cast an Array to an ImmutableList', () => {
      const array = ['one', 'two', 'three'];
      const list = claim(array);
      expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
    });
  });

  describe('copyOf()', () => {
    it('is idempotent for the empty list', () => {
      const empty1 = [];
      const empty2 = [];
      const list1 = copyOf(empty1);
      const list2 = copyOf(empty2);
      expect(list1).toBe(list2);
    });

    it('avoids a copy for a frozen array', () => {
      const array = Object.freeze(['one', 'two', 'three']);
      const list = copyOf(array);
      expect(list).toBe(array);
    });

    it('performs a copy for a non-frozen, non-empty array', () => {
      const array = ['one', 'two', 'three'];
      const list = copyOf(array);
      expect(list).not.toBe(array);
      expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
    });
  });

  describe('toArray()', () => {
    it('modifying the result of toArray() should not affect the original ImmutableList', () => {
      const list = claim(['one', 'two', 'three']);
      const array = toArray(list);
      array.sort();
      expect(list).toEqual(Object.freeze(['one', 'two', 'three']));
      expect(array).toEqual(['one', 'three', 'two']);
    });
  });
});

describe('Some code to exercise Flow', () => {
  it('type cast ImmutableList', () => {
    const array = ['one', 'two', 'three'];
    const list: ImmutableList<string> = (array: any);
    expect(list).toEqual(['one', 'two', 'three']);
  });

  it('Ensure that ImmutableList is numerically indexable.', () => {
    const list = claim(['one', 'two', 'three']);
    const item = list[1];
    expect(item).toBe('two');
  });

  it('Ensure that ImmutableList is Iterable', () => {
    const list = claim(['one', 'two', 'three']);
    const array = [];
    for (const item of list) {
      array.push(item);
    }
    expect(array).toEqual(['one', 'two', 'three']);
  });
});

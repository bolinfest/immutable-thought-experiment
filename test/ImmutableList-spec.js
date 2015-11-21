'use babel';
/* @flow */

import {
  copyOf,
  fromLoneReference,
} from '../src/ImmutableList';

describe('ImmutableList', () => {
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
});

describe('Some code to exercise Flow', () => {
  it('Ensure that ImmutableList is numerically indexable.', () => {
    const list = fromLoneReference(['one', 'two', 'three']);
    const item = list[1];
    expect(item).toBe('two');
  });

  it('Ensure that ImmutableList is Iterable', () => {
    const list = fromLoneReference(['one', 'two', 'three']);
    const array = [];
    for (const item of list) {
      array.push(item);
    }
    expect(array).toEqual(['one', 'two', 'three']);
  });
});

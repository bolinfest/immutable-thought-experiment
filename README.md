# immutable-thought-experiment

Thought experiment: leveraging static typing instead of new data structures to
enforce immutability in JavaScript with [Flow](https://github.com/facebook/flow)
annotations.

## Background

Generally, an immutable list is implemented by creating a data structure
that provides limited access to a mutable array or linked list. Guava's implementation
of `ImmutableList` is an example of the former whereas Facebook's Node module
[immutable](https://github.com/facebook/immutable-js) is an example of the latter.
In both cases, some amount of extra memory is required in addition to the
underlying data structure that you are trying to protect.
In the small, this overhead may be negligible, but in the large, it could be
significant.

Let's take a step back and ask:

> Who are we trying to protect our data from, anyway?

The answer is: your fellow programmers, including yourself! If we could trust
ourselves not to mutate the raw array we were passing around, then there would
be no need to wrap it in another data structure, would there? Unfortunately,
we programmers are untrustworthy beings, so we create these memory-consuming
abstractions to save us from ourselves.

But these abstractions are not required to live in application code. If you
had control of the runtime, the parser, etc., then there are other layers of
the stack at which you could address this problem. This tiny module is an
experiment in using Flow to provide static checks to prevent unintended array
modifications.

## Sample Code

This library introduces a Flow type, `ImmutableList`, whose API is the subset of
`Array`'s API that does not allow modification of the array.
The idea is that if you create an array that no one should
modify, then you should declare its type as `ImmutableList` so that anyone who
gets access to the array cannot modify it unless they go outside of the type
system. Here is an example of our `copyOf()` function, which takes an `Array<T>`
and returns an `ImmutableList<T>`:

```js
import type {ImmutableList} from 'immutable-thought-experiment';

import {List} from 'immutable-thought-experiment';

function readAndVerifyData(): ImmutableList<string> {
  const json = fs.readFileSync('data.json', 'utf8');
  const data: Array<string> = JSON.parse(json);
  verifyData(data);
  return List.copyOf(data);
}
```

Under the hood, all `copyOf()` does is clone the array (and optionally
calls `Object.freeze()` on the fresh clone if it is running in development mode).
Although the caller gets an ordinary array back, Flow does not see it that way.
Instead, Flow reports that you have something called an `ImmutableList`,
whose API is limited to read-only access to the underlying data.
Now the result can be passed around safely and retained by other objects without
every other client having to make its own copy of the array to be sure it doesn't
change out from under it.

In some cases, we can do even better.
In the previous example, we used `copyOf()`, which had to clone the entire
array to create an `ImmutableList` because we had no knowledge of who still
had access to it after the call to `verifyData()`. But consider the case when we
create the array and we are sure no one else has access to it: wouldn't it
be wasteful to create a copy when we know it's unnecessary?
When this happens, we should use `claim()` instead of `copyOf()`:

```js
import type {ImmutableList} from 'immutable-thought-experiment';

import {List} from 'immutable-thought-experiment';
import fs from 'fs';

export function readData(): ImmutableList<string> {
  const json = fs.readFileSync('data.json', 'utf8');
  const data: Array<string> = JSON.parse(json);
  return List.claim(data);
}
```

`claim()` is only supposed to be used when you are certain that no one else
has (or will have) a reference to your array who might modify it.
It relies on this invariant to do something extremely dangerous: *it hands
your array right back to you* (optionally calling `Object.freeze()` before
it does so). In this way, we "tag" your array in Flow without actually
modifying it in any way at runtime.

In most systems, the equivalent of `claim()` would return a new object that
wraps or clones the array. In our case, it just returns the array it was given.
That's it.
A proper whole-program optimizer will remove the calls to `claim()` altogether,
resulting in zero overhead when you know you do not need to make your own copy.

If you make a habit of using `ImmutableList` rather than passing around raw
`Array` objects, you can avoid making copies in many cases. Going back to the
first code sample, if `verifyData()` were updated to take an `ImmutableList`,
then we could replace our use of `copyOf()` with `claim()` as follows:

```js
import type {ImmutableList} from 'immutable-thought-experiment';

import {List} from 'immutable-thought-experiment';

function readAndVerifyData(): ImmutableList<string> {
  const json = fs.readFileSync('data.json', 'utf8');
  const data: Array<string> = JSON.parse(json);
  const list = List.claim(data);
  verifyData(list);
  return list;
}
```

If you receive an `ImmutableList` and want to modify it, then you can use the
`toArray()` function to get your own copy of the data:

```js
const list = readAndVerifyData();
const array: Array<string> = List.toArray();
array.sort();
```

As you may have guessed, once you strip away all of the extra bytes we need
to appease Flow and support development mode, the implementation of this library
is basically:

```js
function copyOf(array) {
  return array.slice();
}

function claim(array) {
  return array;
}

function toArray(array) {
  return array.slice();
}
```

But that's the whole point! The only reason we need to build up all of this
scaffolding to enforce immutability is to trick ourselves into not modifying
data structures that we should not modify! The actual code required to *not*
do something is, as it should be, tiny.

## What are the primary advantages of this approach?

I had [immutable](https://github.com/facebook/immutable-js) in mind when I wrote
this, so I think that this approach has some interesting advantages:

1. **Less code.** As you just saw, the amount of code needed to implement this library
is tiny. By comparison, unminified, `immutable` is almost 5000 lines of code.
This library, combined with a whole-program
optimizer that can do inlining, can be reduced to almost nothing.
If initializing `immutable` is on the critical path of your application,
that could be a big difference.
2. **Less memory.** If most of your arrays are (1) not meant to be modified once they are
created, and (2) are not generally derived from existing arrays, then this approach
could save you a lot of memory compared to `immutable`. You could also mix and match your
use of this library with `immutable`, using the appropriate library depending on how
your array is meant to be used.
3. **Zero overhead.** With this approach, you are dealing with ordinary arrays. There
are no linked list nodes or wrapper classes that you have to go through to read your
data. This may not be a major performance issue in your application, but if it is a
free win, why not take it?

## Should I use this everywhere?

Definitely not.

There are certainly cases where I would expect other types of immutable data
structures to be more performant. For example, if you want an immutable stack, then
[immutable](https://github.com/facebook/immutable-js) is probably a better
choice because its linked list implementation better lends itself to
providing immutable snapshots of a stack as you push and pop in a
memory-efficient way.

Also, this library is likely best used inside your application, but maybe not
at the boundaries of your application. For example, if you have external
customers who are not using Flow, then they may not honor the contract that
we are relying on Flow to enforce. In this way, you might leak references
to internal data structures and put their integrity at risk.

One other thing that you may find odd is that there is no `ImmutableList` *class*,
per se. That means that if you expect to be able to expand the API of
`ImmutableList` by adding more instance methods to it, well, you can't.
Remember that under the hood, you are invoking methods on an array, so
you are limited to its API. (Admittedly, you could modify `Array.prototype`,
but that's gross, especially if you have to interoperate with other JavaScript
code that you don't control.)

Instead, you can introduce a new API by creating a function that takes an
`ImmutableList` as the first argument followed by the arguments for the method
that you hoped to add. From there, you operate on the `ImmutableList` via its public
API, but you are not allowed to store any extra information on it.
If you find that you need to associate additional data with it, then a
`WeakMap` is likely a better option.

## Hmm, is this whole thing even a good idea?

Maybe not. As I mentioned above, this problem could be addressed at various
levels of the stack. Specifically, this implementation works outside of Flow
to achieve its goals. It might make more sense to bake the idea of immutability
directly into Flow's type system.

## Open Issues

The biggest danger with this library is the potential misuse of `claim()`.
It would be helpful to create an ESLint rule or some other static analysis
tool to help catch these issues during development, where possible.

Similarly, Flow provides no safety with respect to assigning values to an
`ImmutableList`. Ideally, it would be possible to specify that the keys
for an `ImmutableList` are read-only, but at the time of this writing, there
is no way to express that in Flow.

Currently, the `types.js` file that defines the `ImmutableList` type is
listed under `[libs]` in the `.flowconfig` file. Ideally, it should not be
in there: a combination of `export type` and `import type` should be used
instead. Unfortunately, doing so seems to break type hints and autocomplete
for `ImmutableList` in Nuclide, so some consultation with the Flow team is
in order.

## PostScript: Rejected Approaches

I tried some other things before I settled on the current implementation.

### Type Alias

Originally, I tried making an ordinary type alias rather using `declare class`
to define `ImmutableList` like this:

```js
type ImmutableList<T> = Array<T>
```

This does not work because any function that claims to take an `ImmutableList`
will still accept a vanilla `Array`, so this does not provide the protections
that we need.

### Typecasting

Instead of a `claim()` function, it is also possible to do the typecasting
yourself using Flow. The problem is that it's really gross:

```js
const list = ((data: any): ImmutableList<string>);
```

By comparison, using a helper function seems much cleaner:

```js
const list = List.claim(data);
```

Again, `claim()` should be trivial to inline, so there should not be any
performance concerns about the overhead it adds.

### Builder Pattern

I started by trying to create an "immutable list builder" in the style of
Guava. Except my implementation would do smart things like not actually
create anything beyond the array (like `claim()` does), but that turned out
to be very verbose:

```js
// builder is actually just an array.
const builder: ImmutableList$Builder<number> = List.newBuilder();

// The implementation of builderPush simply delegates to Array.push().
List.builderPush(builder, 1);
List.builderPush(builder, 2);
List.builderPush(builder, 3);

// The implementation of build() just returns the builder
// since it was an array all along.
const list: ImmutableList<number> = List.build(builder);
```

This API has some major drawbacks:

1. As you can see, it is extremely verbose.
2. The caller is responsible for ensuring that `builder` is only
passed to `build()` once. I added some logic in development mode
to use `Object.freeze()` and `Object.isFrozen()` to perform some
integrity checks, but I wasn't thrilled with it.

In the end, I didn't think the builder was any safer or friendlier
than the API I settled on.

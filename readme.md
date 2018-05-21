This includes two experiments in ergonomics for the living room server and client

#### being able to assert and retract as a transaction

By allowing asserts and retracts to be batched as a single operation,
we can solve some of the problems we've seen with drawings flickering
in and out of existence. I'd like to do this in a literate style, while
preserving the promise/async/await style

```js
// this will make one request to assert, retract, and assert in that order
room
  .assert('one thing')
  .retract('another thing')
  .assert('one more thing')

// we can use await or .then() as well
const { facts } = await room.assert('is this a fact?')
console.dir(facts) // => [ { assert: 'is this a fact?' } ]
```

This abuses setImmediate for the literate style, and I'd love to see tests
of how this can break or proofs that it won't. It was all to avoid having
to explicitly use `.then()` when we dont care.

#### replacing subscribe with 'on'

In this case, on() runs the callback for each assertion, and ONLY for assertions.
It is my hope that is is enough to do a lot of interesting things, and I will
be trying rewriting most processes in this style. Most of the things we have written
only care about new facts (the room is mostly reactive).

This seems worse for aggregations, but you could keep local state or use all()

```js
room
  .assert('my coooooool fact')
  .assert(`coooooool facts are rad)

room.on(
  `my $what fact`,
  `$what facts are $how`,
  ({what, how}) => {
    console.log(`${what} is ${how}`)
  })
  // will print `coooooool is rad`

room
  .assert(`coooooool is bad`)
  // will print `coooooool is bad`
```

#### replacing select with 'all'

Right now, the difference between select() and subscribe() is equivalent to
`EventEmitter`'s once() and on(). That is to say, the data called by the first
callback in subscribe() is the current state of the database, and is handled the same was as a single 'select'.

The tricky thing here is that most uses of select() involve aggregating all the objects and doing some analysis. So we can either change once() to call the callback with `(assertions, retractions)`, or

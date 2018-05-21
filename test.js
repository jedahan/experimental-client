const Room = require(`./room`)
const test = require(`ava`)
const getPort = require(`get-port`)
const server = require(`./server`)

test.beforeEach(async t => {
  const port = await getPort()
  t.context.server = server.create().listen(port)
  t.context.room = Room.create(`http://localhost:${port}`)
})

test.afterEach(t => {
  t.context.server.close()
})

test.cb(`once only gets called for existing assertions`, t => {
  const room = t.context.room
  const asserts = new Set([ `first`, `second` ])
  room
    .assert(`first`)
    .assert(`second`)
    .then(() => {
      room
        .once(`$number`, ({number}) => {
          t.true([`first`, `second`].includes(number))
        })
      setTimeout(() => {
        room.assert(`third`).then(() => t.end())
      }, 150)
    })
})

test(`await works`, async t => {
  const room = t.context.room

  const { facts } = await room.assert(`hello`)
  t.deepEqual(facts, [{assert: `hello`}])
})

test.cb(`on gets called for all assertions`, t => {
  const room = t.context.room
  let asserts = new Set([ `first`, `second`, `third` ])

  room
    .assert(`first`)
    .assert(`second`)
    .then(() => {
      room
        .on(`$number`, ({number}) => {
          t.true(asserts.delete(number))
        })
      setTimeout(() => {
        room.assert(`third`)
          .then(() => {
            t.is(asserts.size, 0)
            t.end()
          })
      }, 150)
    })
})

test.cb(`an assert with no callback works`, t => {
  const room = t.context.room
  room.once(`$what callback assert`, ({what}) => {
    t.is(what, `no`)
    t.end()
  })
  room.assert(`no callback assert`)
})

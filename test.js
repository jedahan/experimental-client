const LiteratePromise = require(`./literatepromise`)
const test = require('ava')

test.cb('we call the full queue once', t => {
  const lp = new LiteratePromise()
  lp.on('processed', queue => {
    t.deepEqual(queue, ['this', 'is', 'cool'])
    t.end()
  })

  lp
    .enqueue('this')
    .enqueue('is')
    .enqueue('cool')
})

test.cb('the queue clears on a second call', t => {
  const lp = new LiteratePromise()
  const processed = queue => {
    t.deepEqual(queue, ['this', 'is', 'cool'])
    lp.off('processed', processed)
  }

  lp.on('processed', processed)

  lp
    .enqueue('this')
    .enqueue('is')
    .enqueue('cool')

  setImmediate(() => {
    lp
      .enqueue('like')
      .enqueue('the')
      .enqueue('coolest')
      .then(resolved => {
        t.is(resolved, `resolved: like,the,coolest`)
        t.end()
      })
  })
})

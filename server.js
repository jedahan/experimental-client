const Koa = require('koa')
const body = require('koa-body')
const cors = require('@koa/cors')
const Socket = require('koa-socket-2')
const Room = require(`@living-room/database-js`)

module.exports = {
  create() {
    return new Server()
  }
}

class Server extends Koa {
  constructor() {
    super()
    const io = new Socket()

    this.use(cors())
    this.use(body({ multipart: true }))

    const room = new Room()
    const client = room.client()

    this.use(async (context, next) => {
      let { facts } = context.request.body
      if (!facts) {
        facts =
          context.request.body &&
          context.request.body.fields &&
          context.request.body.fields.facts
      }
      if (!Array.isArray(facts)) return await next()
      // FIXME: the db does not preserve order right now...
      facts.forEach(fact => {
        if (fact.assert) {
          client.assert(fact.assert)
        } else if (fact.retract) {
          client.retract(fact.retract)
        }
      })
      await client.flushChanges()
      context.status = 200
      context.body = { facts }
      await next()
    })

    io.attach(this)

    this.context.client = client
    const subscriptions = new Set()

    io.use(async (context, next) => {
      context.client = client
      context.subscriptions = subscriptions
      await next()
    })

    io.on('assert', async ({ client, data: facts, acknowledge }) => {
      if (!Array.isArray(facts)) facts = [facts]
      facts.forEach(fact => client.assert(fact))
      await client.flushChanges()
      if (acknowledge) acknowledge(facts)
    })

    io.on('retract', async ({ client, data: facts, acknowledge }) => {
      if (!Array.isArray(facts)) facts = [facts]
      facts.forEach(fact => client.retract(fact))
      await client.flushChanges()
      if (acknowledge) acknowledge(facts)
    })

    io.on('select', async ({ data: facts, client, acknowledge }) => {
      await client.select(facts).doAll(acknowledge)
    })

    io.on(
      'subscribe',
      async ({
        data: patternsString,
        socket,
        client,
        subscriptions,
        acknowledge
      }) => {
        const patterns = JSON.parse(patternsString)
        const subscription = client.subscribe(patterns, changes => {
          socket.emit(patternsString, changes)
        })
        subscriptions.add(subscription)
        if (acknowledge) acknowledge(subscription)
      }
    )
  }
}

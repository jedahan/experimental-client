const fetch = require('node-fetch').default
const io = require('socket.io-client')

module.exports = {
  create(host) {
    return new Room(host)
  }
}

class Room {
  constructor (host) {
    this._host = host || `http://localhost:3000`
    this._socket = io.connect(this._host)
    this._immediate = null
    this._facts = []
  }

  then (onFulfilled, onRejected) {
    clearImmediate(this._immediate)
    return this._request().then(onFulfilled, onRejected)
  }

  once (...facts) {
    const callback = facts.splice(facts.length - 1)[0]
    const cb = ({ assertions }) => {
      assertions.forEach(callback)
    }
    this.subscribe(facts, cb, 'once')
  }

  on (...facts) {
    const callback = facts.splice(facts.length - 1)[0]
    const cb = ({ assertions }) => {
      assertions.forEach(callback)
    }
    this.subscribe(facts, cb, 'on')
  }

  subscribe (facts, callback, fn) {
    const patternsString = JSON.stringify(facts)
    const cb = ({ assertions, retractions }) => {
      callback({
        assertions: assertions.map(this._unwrap),
        retractions: retractions.map(this._unwrap)
      })
    }

    if (fn === 'on') {
      this._socket.on(patternsString, cb)
    } else if (fn === 'once') {
      this._socket.once(patternsString, cb)
    }

    return new Promise((resolve, reject) => {
      this._socket.emit('subscribe', patternsString, resolve)
    })
  }

  _unwrap (fact) {
    const unwrapped = {}
    for (let key in fact) {
      const val = fact[key]
      if (typeof val === 'undefined') continue
      unwrapped[key] = val.value || val.word || val.text || val.id
    }
    if (Object.keys(unwrapped).length === 0) return
    return unwrapped
  }

  _request () {
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facts: this._facts })
    }

    return fetch(this._host, opts)
      .then(response => response.json())
      .catch(error => {
        if (error.code === 'ECONNREFUSED') {
          let customError = new Error(
            `No server listening on ${this._host}. Try 'npm start' to run a local service.`
          )
          customError.code = 'NOTLISTENING'
          throw customError
        } else {
          throw error
        }
      })
      .finally(this._facts = [])
  }

  _queue (facts) {
    clearImmediate(this._immediate)
    this._facts.push(facts)
    this._immediate = setImmediate(this._request.bind(this))
    return this
  }

  assert (facts) {
    return this._queue({assert: facts})
  }

  retract (facts) {
    return this._queue({retract: facts})
  }
}

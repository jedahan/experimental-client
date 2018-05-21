const EventEmitter = require(`events`)

module.exports = class LiteratePromise extends EventEmitter {
  constructor () {
    super()
    this._queue = []
  }

  then (onResolve, onReject) {
    clearImmediate(this._immediate)
    return this.process().then(onResolve, onReject)
  }

  process () {
    return new Promise((resolve, reject) => {
      const queue = this._queue
      this._queue = []
      if (queue.includes('not?')) reject('rejecting: found not?')
      this.emit('processed', queue)
      resolve(`resolved: ${queue}`)
    })
  }

  enqueue (data) {
    clearImmediate(this._immediate)
    this._queue.push(data)
    this._immediate = setImmediate(this.process.bind(this))
    return this
  }
}

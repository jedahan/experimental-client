const EventEmitter = require(`events`)

module.exports = class LiteratePromise extends EventEmitter {
  constructor () {
    super()
    this._queue = []
  }

  then (onResolve, onReject) {
    this.reset()
    return this.process().then(onResolve, onReject)
  }

  process () {
    return new Promise((resolve, reject) => {
      const queue = this._queue
      this._queue = []
      if (queue.includes('this')) this.emit('foundthis', queue)
      resolve(`resolved: ${queue}`)
    })
  }

  reset() {
    clearTimeout(this._timeout)
  }

  enqueue (data) {
    this.reset()
    this._queue.push(data)
    this._timeout = setTimeout(this.process.bind(this))
    return this
  }
}

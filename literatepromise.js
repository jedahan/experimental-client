const FluentPromises = require(`fluent-promises`)
module.exports = class LiteratePromise extends FluentPromises {
  constructor () {
    super()
    this._queue = []
    this._immedaite = null
  }

  then (onResolve, onReject) {
    return this.process(this._queue).then(onResolve, onReject)
  }

  process () {
    return this.makeFluent(() => {
      console.dir(this._queue)
    })
  }

  enqueue (data) {
    return this.makeFluent(() => {
      setImmediate(() => {
        return new Promise((resolve, reject) => {
          this._queue.push(data)
        })
      })
    })
  }
}

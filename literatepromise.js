module.exports = class LiteratePromise {
  constructor () {
    this._queue = []
  }

  then (onResolve, onReject) {

    return this.process(this._queue)
      .then(onResolve, onReject)
  }

  process (queue) {
    return new Promise((resolve, reject) => {
      this._queue = []
      if (!Array.isArray(queue)) resolve('resolved: empty')
      if (queue.includes('not?')) reject('rejecting: found not?')
      console.log(`processing ${queue}`)
      resolve(`resolved: ${queue}`)
    })
  }

  enqueue (data) {
    this._queue.push(data)
    process.nextTick(this.process.bind(this), this._queue)
    return this
  }
}

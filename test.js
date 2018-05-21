// This is a test of the abuse of setImmediate,
// and understanding if there is a race condition
// so we can have an l i t e r a t e   p r o m i s e

const LiteratePromise = require(`./literatepromise`)
const lp = new LiteratePromise()

const first = () => {
  console.log('first enqueue')
  lp
    .enqueue('this')
    .enqueue('is')
    .enqueue('cool')
}

const second = () => {
  console.log('second enqueue')
  lp
    .enqueue('like')
    .enqueue('the')
    .enqueue('coolest')
    .then(console.log)
}


const third = () => {
  console.log('third enqueue')
  lp
    .enqueue('is')
    .enqueue('it')
    .enqueue('not?')
    .then(null, console.error)
}

const fourth = async () => {
  console.log('await enqueue')
  const wat = await lp.enqueue('indeed').enqueue('it').enqueue('is')
  console.dir(wat)
}

first()
second()
third()
fourth()


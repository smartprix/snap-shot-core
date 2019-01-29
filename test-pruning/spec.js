// console.log(process.env)
const join = require('path').join
// console.log(module)
module.paths.unshift(join(__dirname, '..', '..'))
// console.log('module.paths')
// console.log(module.paths)

// const resolve = module.require.resolve
// // console.log('require.resolve', require.resolve)
// module.require.resolve = (request, options) => {
//   console.log('resolving', request)
//   return resolve(request, options)
// }

const devSnapShotCore = require('..')
const stubs = {
  'snap-shot-core': {
    ...devSnapShotCore,
    '@runtimeGlobal': true
  }
}

console.log('stubs', stubs)

const proxyquire = require('proxyquire')
const snapshot = proxyquire('@smpx/snap-shot-it', stubs)

// const snapshot = require('@smpx/snap-shot-it')

/* eslint-env mocha */
it('a', () => {
  snapshot('foo')
  snapshot('bar')
})

it('b', () => {
  snapshot('foo')
  // snapshot('bar')
})

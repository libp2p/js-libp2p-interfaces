/* eslint-env mocha */
'use strict'

const tests = require('../../src/peer-discovery/tests')
const MockDiscovery = require('./mock-discovery')

describe('compliance tests', () => {
  let intervalId

  tests({
    async setup () {
      await new Promise(resolve => setTimeout(resolve, 10))

      const mockDiscovery = new MockDiscovery({
        discoveryDelay: 1
      })

      intervalId = setInterval(mockDiscovery._discoverPeer, 1000)

      return mockDiscovery
    },
    async teardown () {
      clearInterval(intervalId)
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  })
})

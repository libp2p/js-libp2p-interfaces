/* eslint-env mocha */
'use strict'

const tests = require('../../src/peer-discovery/tests')
const MockDiscovery = require('./mock-discovery')

describe('compliance tests', () => {
  let intervalId

  tests({
    setup () {
      const mockDiscovery = new MockDiscovery({
        discoveryDelay: 1
      })

      intervalId = setInterval(mockDiscovery._discoverPeer, 1000)

      return mockDiscovery
    },
    teardown () {
      clearInterval(intervalId)
    }
  })
})

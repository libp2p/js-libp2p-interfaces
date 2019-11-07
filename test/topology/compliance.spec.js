/* eslint-env mocha */
'use strict'

const tests = require('../../src/topology/tests')
const Topology = require('../../src/topology')
const MockPeerStore = require('./mock-peer-store')

describe('compliance tests', () => {
  tests({
    setup (properties, registrar) {
      const multicodecs = ['/echo/1.0.0']
      const handlers = {
        onConnect: () => { },
        onDisconnect: () => { }
      }

      const topology = new Topology({
        multicodecs,
        handlers,
        ...properties
      })

      if (!registrar) {
        const peerStore = new MockPeerStore([])

        registrar = {
          peerStore,
          getConnection: () => {}
        }
      }

      topology.registrar = registrar

      return topology
    },
    teardown () {
      // cleanup resources created by setup()
    }
  })
})

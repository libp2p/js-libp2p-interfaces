/* eslint-env mocha */
'use strict'

const tests = require('../../src/topology/tests/multicodec-topology')
const MulticodecTopology = require('../../src/topology/multicodec-topology')
const MockPeerStore = require('./mock-peer-store')

describe('multicodec topology compliance tests', () => {
  tests({
    setup (properties, registrar) {
      const multicodecs = ['/echo/1.0.0']
      const handlers = {
        onConnect: () => { },
        onDisconnect: () => { }
      }

      const topology = new MulticodecTopology({
        multicodecs,
        handlers,
        ...properties
      })

      if (!registrar) {
        const peers = new Map()
        const peerStore = new MockPeerStore(peers)

        registrar = {
          peerStore,
          getConnection: () => { }
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

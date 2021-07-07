/* eslint-env mocha */
'use strict'

const tests = require('../../src/topology/topology')
const Topology = require('libp2p-interfaces/src/topology')

describe('topology compliance tests', () => {
  tests({
    setup (properties) {
      const handlers = {
        onConnect: () => { },
        onDisconnect: () => { }
      }

      const topology = new Topology({
        handlers,
        ...properties
      })

      return topology
    },
    teardown () {
      // cleanup resources created by setup()
    }
  })
})

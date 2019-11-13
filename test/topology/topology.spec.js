/* eslint-env mocha */
'use strict'

const tests = require('../../src/topology/tests/topology')
const Topology = require('../../src/topology')

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

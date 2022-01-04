import tests from '../../src/topology/topology.js'
import { Topology } from '@libp2p/topology'

describe('topology compliance tests', () => {
  tests({
    async setup (properties) {
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
    async teardown () {
      // cleanup resources created by setup()
    }
  })
})

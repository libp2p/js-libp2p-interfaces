import tests from '../../src/peer-discovery/index.js'
import { MockDiscovery } from './mock-discovery.js'

describe('compliance tests', () => {
  let intervalId: any

  tests({
    async setup () {
      const mockDiscovery = new MockDiscovery({
        discoveryDelay: 1
      })

      intervalId = setInterval(mockDiscovery._discoverPeer, 1000)

      return mockDiscovery
    },
    async teardown () {
      clearInterval(intervalId)
    }
  })
})

import { EventEmitter } from 'events'
import tests from '../../src/topology/multicodec-topology.js'
import { MulticodecTopology } from '@libp2p/topology/multicodec-topology'
import { MockPeerStore } from './mock-peer-store.js'

describe('multicodec topology compliance tests', () => {
  tests({
    async setup (properties) {
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

      const peers = new Map()
      const peerStore = new MockPeerStore(peers)
      const connectionManager = new EventEmitter()

      const registrar = {
        peerStore,
        connectionManager,
        getConnection: () => {
          return undefined
        },
        handle: () => {
          throw new Error('Not implemented')
        },
        register: () => {
          throw new Error('Not implemented')
        },
        unregister: () => {
          throw new Error('Not implemented')
        }
      }

      topology.registrar = registrar

      return topology
    },
    async teardown () {
      // cleanup resources created by setup()
    }
  })
})

import tests from '@libp2p/interface-compliance-tests/connection'
import { createConnection } from '../src/index.js'
import peers from '@libp2p/interface-compliance-tests/utils/peers'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { Multiaddr } from '@multiformats/multiaddr'
import { pair } from 'it-pair'
import type { Stream } from '@libp2p/interfaces/connection'

describe('compliance tests', () => {
  tests({
    /**
     * Test setup. `properties` allows the compliance test to override
     * certain values for testing.
     */
    async setup (properties) {
      const remoteAddr = new Multiaddr('/ip4/127.0.0.1/tcp/8081')
      const remotePeer = await PeerIdFactory.createFromJSON(peers[0])
      const openStreams: Stream[] = []
      let streamId = 0

      const connection = createConnection({
        remotePeer,
        remoteAddr,
        stat: {
          timeline: {
            open: Date.now() - 10,
            upgraded: Date.now()
          },
          direction: 'outbound',
          encryption: '/secio/1.0.0',
          multiplexer: '/mplex/6.7.0',
          status: 'OPEN'
        },
        newStream: async (protocols) => {
          const id = `${streamId++}`
          const stream: Stream = {
            ...pair<Uint8Array>(),
            close: () => {
              void stream.sink(async function * () {}())
              connection.removeStream(stream.id)
            },
            closeRead: () => {},
            closeWrite: () => {
              void stream.sink(async function * () {}())
            },
            id,
            abort: () => {},
            reset: () => {},
            timeline: {
              open: 0
            }
          }

          openStreams.push(stream)

          return {
            stream,
            protocol: protocols[0]
          }
        },
        close: async () => {},
        getStreams: () => openStreams,
        ...properties
      })
      return connection
    },
    async teardown () {
      // cleanup resources created by setup()
    }
  })
})

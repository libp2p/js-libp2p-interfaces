import tests from '../../src/connection/index.js'
import { Connection } from '@libp2p/connection'
import peers from '../../src/utils/peers.js'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { Multiaddr } from 'multiaddr'
// @ts-expect-error no types
import pair from 'it-pair'
import type { MuxedStream } from '@libp2p/interfaces/stream-muxer'

describe('compliance tests', () => {
  tests({
    /**
     * Test setup. `properties` allows the compliance test to override
     * certain values for testing.
     */
    async setup (properties) {
      const localAddr = new Multiaddr('/ip4/127.0.0.1/tcp/8080')
      const remoteAddr = new Multiaddr('/ip4/127.0.0.1/tcp/8081')
      const [localPeer, remotePeer] = await Promise.all([
        PeerIdFactory.createFromJSON(peers[0]),
        PeerIdFactory.createFromJSON(peers[1])
      ])
      const openStreams: MuxedStream[] = []
      let streamId = 0

      const connection = new Connection({
        localPeer,
        remotePeer,
        localAddr,
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
          const stream: MuxedStream = {
            ...pair(),
            close: async () => {
              await stream.sink(async function * () {}())
              connection.removeStream(stream.id)
            },
            id,
            abort: () => {},
            reset: () => {},
            timeline: {
              open: 0
            },
            [Symbol.asyncIterator]: () => stream.source
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

/* eslint-env mocha */
'use strict'

const tests = require('../../src/connection/tests')
const { Connection } = require('../../src/connection')
const peers = require('../../src/utils/peers')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const pair = require('it-pair')

describe('compliance tests', () => {
  tests({
    /**
     * Test setup. `properties` allows the compliance test to override
     * certain values for testing.
     *
     * @param {*} properties
     */
    async setup (properties) {
      const localAddr = multiaddr('/ip4/127.0.0.1/tcp/8080')
      const remoteAddr = multiaddr('/ip4/127.0.0.1/tcp/8081')
      const [localPeer, remotePeer] = await Promise.all([
        PeerId.createFromJSON(peers[0]),
        PeerId.createFromJSON(peers[1])
      ])
      const openStreams = []
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
          multiplexer: '/mplex/6.7.0'
        },
        newStream: (protocols) => {
          const id = streamId++
          const stream = pair()

          stream.close = async () => {
            await stream.sink([])
            connection.removeStream(stream.id)
          }
          stream.id = id

          openStreams.push(stream)

          return {
            stream,
            protocol: protocols[0]
          }
        },
        close: () => {},
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

/* eslint-env mocha */
'use strict'

const { Connection } = require('../../src/connection')
const peers = require('../utils/peers')
const PeerId = require('peer-id')
const pair = require('it-pair')

describe('connection tests', () => {
  it('should not require local or remote addrs', async () => {
    const [localPeer, remotePeer] = await Promise.all([
      PeerId.createFromJSON(peers[0]),
      PeerId.createFromJSON(peers[1])
    ])
    const openStreams = []
    let streamId = 0

    return new Connection({
      localPeer,
      remotePeer,
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

        stream.close = () => stream.sink([])
        stream.id = id

        openStreams.push(stream)

        return {
          stream,
          protocol: protocols[0]
        }
      },
      close: () => {},
      getStreams: () => openStreams
    })
  })
})

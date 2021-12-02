import { expect } from 'aegir/utils/chai.js'
// @ts-expect-error no types
import duplexPair from 'it-pair/duplex.js'
import { pipe } from 'it-pipe'
import * as PeerIdFactory from 'libp2p-peer-id-factory'
import { collect } from 'streaming-iterables'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import peers from '../utils/peers.js'
import { UnexpectedPeerError } from 'libp2p-interfaces/crypto/errors'
import type { TestSetup } from '../index.js'
import type { Crypto } from 'libp2p-interfaces/crypto'
import type { PeerId } from 'libp2p-peer-id'

export default (common: TestSetup<Crypto>) => {
  describe('interface-crypto compliance tests', () => {
    let crypto: Crypto
    let localPeer: PeerId
    let remotePeer: PeerId
    let mitmPeer: PeerId

    before(async () => {
      [
        crypto,
        localPeer,
        remotePeer,
        mitmPeer
      ] = await Promise.all([
        common.setup(),
        PeerIdFactory.createFromJSON(peers[0]),
        PeerIdFactory.createFromJSON(peers[1]),
        PeerIdFactory.createFromJSON(peers[2])
      ])
    })

    after(async () => {
      await common.teardown()
    })

    it('has a protocol string', () => {
      expect(crypto.protocol).to.exist()
      expect(crypto.protocol).to.be.a('string')
    })

    it('it wraps the provided duplex connection', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Echo server
      pipe(inboundResult.conn, inboundResult.conn)

      // Send some data and collect the result
      const input = uint8ArrayFromString('data to encrypt')
      const result = await pipe(
        [input],
        outboundResult.conn,
        // Convert BufferList to Buffer via slice
        (source: AsyncIterable<Uint8Array>) => (async function * toBuffer () {
          for await (const chunk of source) {
            yield chunk.slice()
          }
        })(),
        collect
      )

      expect(result).to.eql([input])
    })

    it('should return the remote peer id', async () => {
      const [localConn, remoteConn] = duplexPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Inbound should return the initiator (local) peer
      expect(inboundResult.remotePeer.toBytes()).to.equalBytes(localPeer.toBytes())
      // Outbound should return the receiver (remote) peer
      expect(outboundResult.remotePeer.toBytes()).to.equalBytes(remotePeer.toBytes())
    })

    it('inbound connections should verify peer integrity if known', async () => {
      const [localConn, remoteConn] = duplexPair()

      await Promise.all([
        crypto.secureInbound(remotePeer, localConn, mitmPeer),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ]).then(() => expect.fail(), (err) => {
        expect(err).to.exist()
        expect(err).to.have.property('code', UnexpectedPeerError.code)
      })
    })
  })
}

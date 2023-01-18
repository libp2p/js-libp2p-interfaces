import { expect } from 'aegir/chai'
import { pipe } from 'it-pipe'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import all from 'it-all'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import peers from '@libp2p/interface-compliance-tests/peers'
import { UnexpectedPeerError } from '@libp2p/interface-connection-encrypter/errors'
import { createMaConnPair } from './utils/index.js'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { ConnectionEncrypter } from '@libp2p/interface-connection-encrypter'
import type { PeerId } from '@libp2p/interface-peer-id'

export default (common: TestSetup<ConnectionEncrypter>): void => {
  describe('interface-connection-encrypter compliance tests', () => {
    let crypto: ConnectionEncrypter
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
      const [localConn, remoteConn] = createMaConnPair()

      const [
        inboundResult,
        outboundResult
      ] = await Promise.all([
        crypto.secureInbound(remotePeer, localConn),
        crypto.secureOutbound(localPeer, remoteConn, remotePeer)
      ])

      // Echo server
      void pipe(inboundResult.conn, inboundResult.conn)

      // Send some data and collect the result
      const input = uint8ArrayFromString('data to encrypt')
      const result = await pipe(
        [input],
        outboundResult.conn,
        async (source) => await all(source)
      )

      expect(result).to.eql([input])
    })

    it('should return the remote peer id', async () => {
      const [localConn, remoteConn] = createMaConnPair()

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
      const [localConn, remoteConn] = createMaConnPair()

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

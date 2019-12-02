/* eslint-env mocha */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))
const sinon = require('sinon')

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const peers = require('../../utils/peers')

module.exports = (test) => {
  describe('multicodec topology', () => {
    let topology, peer

    beforeEach(async () => {
      topology = await test.setup()
      if (!topology) throw new Error('missing multicodec topology')

      const id = await PeerId.createFromJSON(peers[0])
      peer = await PeerInfo.create(id)
    })

    afterEach(async () => {
      sinon.restore()
      await test.teardown()
    })

    it('should have properties set', () => {
      expect(topology.multicodecs).to.exist()
      expect(topology._onConnect).to.exist()
      expect(topology._onDisconnect).to.exist()
      expect(topology.peers).to.exist()
      expect(topology._registrar).to.exist()
    })

    it('should trigger "onDisconnect" on peer disconnected', () => {
      sinon.spy(topology, '_onDisconnect')
      topology.disconnect(peer)

      expect(topology._onDisconnect.callCount).to.equal(1)
    })

    it('should update peers on protocol change', async () => {
      sinon.spy(topology, '_updatePeers')
      expect(topology.peers.size).to.eql(0)

      const id2 = await PeerId.createFromJSON(peers[1])
      const peer2 = await PeerInfo.create(id2)
      topology.multicodecs.forEach((m) => peer2.protocols.add(m))

      const peerStore = topology._registrar.peerStore
      peerStore.emit('change:protocols', {
        peerInfo: peer2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology._updatePeers.callCount).to.equal(1)
      expect(topology.peers.size).to.eql(1)
    })

    it('should disconnect if peer no longer supports a protocol', async () => {
      sinon.spy(topology, '_onDisconnect')
      expect(topology.peers.size).to.eql(0)

      const id2 = await PeerId.createFromJSON(peers[1])
      const peer2 = await PeerInfo.create(id2)
      topology.multicodecs.forEach((m) => peer2.protocols.add(m))

      const peerStore = topology._registrar.peerStore
      peerStore.emit('change:protocols', {
        peerInfo: peer2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology.peers.size).to.eql(1)

      topology.multicodecs.forEach((m) => peer2.protocols.delete(m))
      // Peer does not support the protocol anymore
      peerStore.emit('change:protocols', {
        peerInfo: peer2,
        protocols: []
      })

      expect(topology.peers.size).to.eql(1)
      expect(topology._onDisconnect.callCount).to.equal(1)
      expect(topology._onDisconnect.calledWith(peer2)).to.equal(true)
    })
  })
}

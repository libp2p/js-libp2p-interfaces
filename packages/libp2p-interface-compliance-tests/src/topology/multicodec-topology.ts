import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import * as PeerIdFactory from 'libp2p-peer-id-factory'
import peers from '../utils/peers.js'
import type { TestSetup } from '../index.js'
import type { MulticodecTopology } from 'libp2p-interfaces/topology'
import type { PeerId } from 'libp2p-interfaces/peer-id'

export default (test: TestSetup<MulticodecTopology>) => {
  describe('multicodec topology', () => {
    let topology: MulticodecTopology, id: PeerId

    beforeEach(async () => {
      topology = await test.setup()

      id = await PeerIdFactory.createFromJSON(peers[0])
    })

    afterEach(async () => {
      sinon.restore()
      await test.teardown()
    })

    it('should have properties set', () => {
      expect(topology.multicodecs).to.exist()
      expect(topology.peers).to.exist()
    })

    it('should trigger "onDisconnect" on peer disconnected', () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onDisconnect')
      topology.disconnect(id)

      expect(topology).to.have.nested.property('_onDisconnect.callCount', 1)
    })

    it('should update peers on protocol change', async () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_updatePeers')
      expect(topology.peers.size).to.eql(0)

      // @ts-expect-error protected property
      const peerStore = topology._registrar.peerStore

      const id2 = await PeerIdFactory.createFromJSON(peers[1])
      peerStore.peers.set(id2.toString(), {
        id: id2,
        protocols: Array.from(topology.multicodecs)
      })

      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology).to.have.nested.property('_updatePeers.callCount', 1)
      expect(topology.peers.size).to.eql(1)
    })

    it('should disconnect if peer no longer supports a protocol', async () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onDisconnect')
      expect(topology.peers.size).to.eql(0)

      // @ts-expect-error protected property
      const peerStore = topology._registrar.peerStore

      const id2 = await PeerIdFactory.createFromJSON(peers[1])
      peerStore.peers.set(id2.toString(), {
        id: id2,
        protocols: Array.from(topology.multicodecs)
      })

      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: Array.from(topology.multicodecs)
      })

      expect(topology.peers.size).to.eql(1)

      peerStore.peers.set(id2.toString(), {
        id: id2,
        protocols: []
      })
      // Peer does not support the protocol anymore
      peerStore.emit('change:protocols', {
        peerId: id2,
        protocols: []
      })

      expect(topology.peers.size).to.eql(1)
      expect(topology).to.have.nested.property('_onDisconnect.callCount', 1)
      // @ts-expect-error protected property
      expect(topology._onDisconnect.calledWith(id2)).to.equal(true)
    })

    it('should trigger "onConnect" when a peer connects and has one of the topology multicodecs in its known protocols', () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onConnect')
      // @ts-expect-error protected property
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns(topology.multicodecs)
      // @ts-expect-error protected property
      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology).to.have.nested.property('_onConnect.callCount', 1)
    })

    it('should not trigger "onConnect" when a peer connects and has none of the topology multicodecs in its known protocols', () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onConnect')
      // @ts-expect-error protected property
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns([])
      // @ts-expect-error protected property
      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology).to.have.nested.property('_onConnect.callCount', 0)
    })

    it('should not trigger "onConnect" when a peer connects and its protocols are not known', () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onConnect')
      // @ts-expect-error protected property
      sinon.stub(topology._registrar.peerStore.protoBook, 'get').returns(undefined)
      // @ts-expect-error protected property
      topology._registrar.connectionManager.emit('peer:connect', {
        remotePeer: id
      })

      expect(topology).to.have.nested.property('_onConnect.callCount', 0)
    })
  })
}

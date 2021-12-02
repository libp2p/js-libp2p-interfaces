import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import * as PeerIdFactory from 'libp2p-peer-id-factory'
import peers from '../utils/peers.js'
import type { TestSetup } from '../index.js'
import type { Topology } from 'libp2p-interfaces/topology'
import type { PeerId } from 'libp2p-peer-id'

export default (test: TestSetup<Topology>) => {
  describe('topology', () => {
    let topology: Topology, id: PeerId

    beforeEach(async () => {
      topology = await test.setup()

      id = await PeerIdFactory.createFromJSON(peers[0])
    })

    afterEach(async () => {
      sinon.restore()
      await test.teardown()
    })

    it('should have properties set', () => {
      expect(topology.min).to.exist()
      expect(topology.max).to.exist()
      expect(topology.peers).to.exist()
    })

    it('should trigger "onDisconnect" on peer disconnected', () => {
      // @ts-expect-error protected property
      sinon.spy(topology, '_onDisconnect')
      topology.disconnect(id)

      expect(topology).to.have.nested.property('_onDisconnect.callCount', 1)
    })
  })
}

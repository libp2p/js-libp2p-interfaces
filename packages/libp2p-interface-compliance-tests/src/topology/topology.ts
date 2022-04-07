import { expect } from 'aegir/chai'
import sinon from 'sinon'
import type { TestSetup } from '../index.js'
import type { Topology } from '@libp2p/interfaces/topology'

export default (test: TestSetup<Topology>) => {
  describe('topology', () => {
    let topology: Topology

    beforeEach(async () => {
      topology = await test.setup()
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
  })
}

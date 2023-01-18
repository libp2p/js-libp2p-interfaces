import { expect } from 'aegir/chai'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { Transport } from '@libp2p/interface-transport'
import type { TransportTestFixtures } from './index.js'
import type { Multiaddr } from '@multiformats/multiaddr'

export default (common: TestSetup<TransportTestFixtures>): void => {
  describe('filter', () => {
    let addrs: Multiaddr[]
    let transport: Transport

    before(async () => {
      ({ addrs, transport } = await common.setup())
    })

    after(async () => {
      await common.teardown()
    })

    it('filters addresses', () => {
      const filteredAddrs = transport.filter(addrs)
      expect(filteredAddrs).to.eql(addrs)
    })
  })
}

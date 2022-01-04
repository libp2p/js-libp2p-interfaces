import { expect } from 'aegir/utils/chai.js'
import { mockUpgrader } from './utils/index.js'
import type { TestSetup } from '../index.js'
import type { Transport } from 'libp2p-interfaces/transport'
import type { TransportTestFixtures, SetupArgs } from './index.js'
import type { Multiaddr } from 'multiaddr'

export default (common: TestSetup<TransportTestFixtures, SetupArgs>) => {
  describe('filter', () => {
    let addrs: Multiaddr[]
    let transport: Transport<any, any>

    before(async () => {
      ({ addrs, transport } = await common.setup({ upgrader: mockUpgrader() }))
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

import dial from './dial-test.js'
import listen from './listen-test.js'
import filter from './filter-test.js'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { Transport } from '@libp2p/interface-transport'
import type { Multiaddr } from '@multiformats/multiaddr'

export interface Connector {
  delay: (ms: number) => void
  restore: () => void
}

export interface TransportTestFixtures {
  addrs: Multiaddr[]
  transport: Transport
  connector: Connector
}

export default (common: TestSetup<TransportTestFixtures>): void => {
  describe('interface-transport', () => {
    dial(common)
    listen(common)
    filter(common)
  })
}

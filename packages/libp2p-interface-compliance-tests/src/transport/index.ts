import dial from './dial-test.js'
import listen from './listen-test.js'
import filter from './filter-test.js'
import type { TestSetup } from '../index.js'
import type { Transport, Upgrader } from '@libp2p/interfaces/transport'
import type { Multiaddr } from 'multiaddr'

export interface Connector {
  delay: (ms: number) => void
  restore: () => void
}

export interface TransportTestFixtures {
  addrs: Multiaddr[]
  transport: Transport<{}, {}>
  connector: Connector
}

export interface SetupArgs {
  upgrader: Upgrader
}

export default (common: TestSetup<TransportTestFixtures, SetupArgs>) => {
  describe('interface-transport', () => {
    dial(common)
    listen(common)
    filter(common)
  })
}

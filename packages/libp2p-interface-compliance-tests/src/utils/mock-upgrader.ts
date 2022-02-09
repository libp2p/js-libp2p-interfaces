import { expect } from 'aegir/utils/chai.js'
import { mockMuxer } from './mock-muxer.js'
import { mockConnection } from './mock-connection.js'
import type { Upgrader, MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Muxer } from '@libp2p/interfaces/stream-muxer'

export interface MockUpgraderOptions {
  muxer?: Muxer
}

export function mockUpgrader (options: MockUpgraderOptions = {}) {
  const ensureProps = (multiaddrConnection: MultiaddrConnection) => {
    ['sink', 'source', 'remoteAddr', 'timeline', 'close'].forEach(prop => {
      expect(multiaddrConnection).to.have.property(prop)
    })
    return multiaddrConnection
  }

  const muxer = options.muxer ?? mockMuxer()

  const upgrader: Upgrader = {
    async upgradeOutbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await mockConnection(multiaddrConnection, 'outbound', muxer)
    },
    async upgradeInbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return await mockConnection(multiaddrConnection, 'inbound', muxer)
    }
  }

  return upgrader
}

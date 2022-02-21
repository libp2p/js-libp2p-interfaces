import { expect } from 'aegir/utils/chai.js'
import { mockConnection } from './connection.js'
import type { Upgrader, MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Registrar } from '@libp2p/interfaces/registrar'

export interface MockUpgraderOptions {
  registrar?: Registrar
}

export function mockUpgrader (options: MockUpgraderOptions = {}) {
  const ensureProps = (multiaddrConnection: MultiaddrConnection) => {
    ['sink', 'source', 'remoteAddr', 'timeline', 'close'].forEach(prop => {
      expect(multiaddrConnection).to.have.property(prop)
    })
    return multiaddrConnection
  }

  const upgrader: Upgrader = {
    async upgradeOutbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return mockConnection(multiaddrConnection, {
        direction: 'outbound',
        registrar: options.registrar
      })
    },
    async upgradeInbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return mockConnection(multiaddrConnection, {
        direction: 'inbound',
        registrar: options.registrar
      })
    }
  }

  return upgrader
}

import { expect } from 'aegir/utils/chai.js'
import { mockConnection } from './connection.js'
import type { Upgrader, MultiaddrConnection } from '@libp2p/interfaces/transport'
import type { Registrar } from '@libp2p/interfaces/registrar'

export interface MockUpgraderInit {
  registrar?: Registrar
}

export function mockUpgrader (init: MockUpgraderInit = {}) {
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
        registrar: init.registrar
      })
    },
    async upgradeInbound (multiaddrConnection) {
      ensureProps(multiaddrConnection)
      return mockConnection(multiaddrConnection, {
        direction: 'inbound',
        registrar: init.registrar
      })
    }
  }

  return upgrader
}

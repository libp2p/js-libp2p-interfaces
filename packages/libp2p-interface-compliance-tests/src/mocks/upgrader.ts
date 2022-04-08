import { expect } from 'aegir/chai'
import { mockConnection } from './connection.js'
import type { Upgrader, MultiaddrConnection, UpgraderEvents } from '@libp2p/interfaces/transport'
import type { Registrar } from '@libp2p/interfaces/registrar'
import { EventEmitter } from '@libp2p/interfaces'

export interface MockUpgraderInit {
  registrar?: Registrar
}

function ensureProps (multiaddrConnection: MultiaddrConnection) {
  ['sink', 'source', 'remoteAddr', 'timeline', 'close'].forEach(prop => {
    expect(multiaddrConnection).to.have.property(prop)
  })
  return multiaddrConnection
}

class MockUpgrader extends EventEmitter<UpgraderEvents> implements Upgrader {
  private readonly registrar?: Registrar

  constructor (init: MockUpgraderInit = {}) {
    super()

    this.registrar = init.registrar
  }

  async upgradeOutbound (multiaddrConnection: MultiaddrConnection) {
    ensureProps(multiaddrConnection)
    return mockConnection(multiaddrConnection, {
      direction: 'outbound',
      registrar: this.registrar
    })
  }

  async upgradeInbound (multiaddrConnection: MultiaddrConnection) {
    ensureProps(multiaddrConnection)
    return mockConnection(multiaddrConnection, {
      direction: 'inbound',
      registrar: this.registrar
    })
  }
}

export function mockUpgrader (init: MockUpgraderInit = {}) {
  return new MockUpgrader(init)
}

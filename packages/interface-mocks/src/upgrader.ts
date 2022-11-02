import { mockConnection } from './connection.js'
import type { Upgrader, UpgraderEvents, UpgraderOptions } from '@libp2p/interface-transport'
import type { MultiaddrConnection } from '@libp2p/interface-connection'
import type { Registrar } from '@libp2p/interface-registrar'
import { EventEmitter } from '@libp2p/interfaces/events'

export interface MockUpgraderInit {
  registrar?: Registrar
}

class MockUpgrader extends EventEmitter<UpgraderEvents> implements Upgrader {
  private readonly registrar?: Registrar

  constructor (init: MockUpgraderInit = {}) {
    super()

    this.registrar = init.registrar
  }

  async upgradeOutbound (multiaddrConnection: MultiaddrConnection, opts: UpgraderOptions = {}) {
    return mockConnection(multiaddrConnection, {
      direction: 'outbound',
      registrar: this.registrar,
      ...opts
    })
  }

  async upgradeInbound (multiaddrConnection: MultiaddrConnection, opts: UpgraderOptions = {}) {
    return mockConnection(multiaddrConnection, {
      direction: 'inbound',
      registrar: this.registrar,
      ...opts
    })
  }
}

export function mockUpgrader (init: MockUpgraderInit = {}) {
  return new MockUpgrader(init)
}

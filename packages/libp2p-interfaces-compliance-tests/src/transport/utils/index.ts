import { expect } from 'aegir/utils/chai.js'
import type { Upgrader, MultiaddrConnection } from 'libp2p-interfaces/transport'

/**
 * A tick is considered valid if it happened between now
 * and `ms` milliseconds ago
 */
export function isValidTick (date?: number, ms: number = 5000) {
  if (date == null) {
    throw new Error('date must be a number')
  }

  const now = Date.now()

  if (date > now - ms && date <= now) {
    return true
  }

  return false
}

export function mockUpgrader () {
  const _upgrade = async (multiaddrConnection: MultiaddrConnection) => {
    ['sink', 'source', 'remoteAddr', 'conn', 'timeline', 'close'].forEach(prop => {
      expect(multiaddrConnection).to.have.property(prop)
    })
    expect(isValidTick(multiaddrConnection.timeline.open)).to.equal(true)
    return multiaddrConnection
  }
  const upgrader: Upgrader = {
    // @ts-expect-error we return a MultiaddrConnetion that is not a Connection
    async upgradeOutbound (multiaddrConnection) {
      return await _upgrade(multiaddrConnection)
    },
    // @ts-expect-error we return a MultiaddrConnetion that is not a Connection
    async upgradeInbound (multiaddrConnection) {
      return await _upgrade(multiaddrConnection)
    }
  }

  return upgrader
}

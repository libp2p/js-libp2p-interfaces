// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')

module.exports = (common) => {
  const upgrader = {
    _upgrade (multiaddrConnection) {
      return multiaddrConnection
    },
    upgradeOutbound (multiaddrConnection) {
      return upgrader._upgrade(multiaddrConnection)
    },
    upgradeInbound (multiaddrConnection) {
      return upgrader._upgrade(multiaddrConnection)
    }
  }

  describe('filter', () => {
    let addrs
    let transport

    before(async () => {
      ({ addrs, transport } = await common.setup({ upgrader }))
    })

    after(() => common.teardown && common.teardown())

    it('filters addresses', () => {
      const filteredAddrs = transport.filter(addrs)
      expect(filteredAddrs).to.eql(addrs)
    })
  })
}

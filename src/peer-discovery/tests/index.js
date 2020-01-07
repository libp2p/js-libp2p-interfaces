/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const PeerId = require('peer-id')

const pDefer = require('p-defer')

module.exports = (common) => {
  describe('interface-peer-discovery', () => {
    let discovery

    before(async () => {
      discovery = await common.setup()
    })

    after(() => common.teardown && common.teardown())

    afterEach('ensure discovery was stopped', () => discovery.stop())

    it('can start the service', async () => {
      await discovery.start()
    })

    it('can start and stop the service', async () => {
      await discovery.start()
      await discovery.stop()
    })

    it('should not fail to stop the service if it was not started', async () => {
      await discovery.stop()
    })

    it('should not fail to start the service if it is already started', async () => {
      await discovery.start()
      await discovery.start()
    })

    it('should emit an event with the discovered PeerId when _onPeer is called', async () => {
      const deferred = pDefer()
      const peerId = await PeerId.create({ bits: 512 })

      discovery.on('peer', (id) => {
        expect(PeerId.isPeerId(id)).to.eql(true)
        deferred.resolve()
      })

      discovery._onPeer(peerId)

      await deferred.promise
    })
  })
}

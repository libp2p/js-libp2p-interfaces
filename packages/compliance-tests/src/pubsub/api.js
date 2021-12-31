// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const pDefer = require('p-defer')
const pWaitFor = require('p-wait-for')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const topic = 'foo'
const data = uint8ArrayFromString('bar')

module.exports = (common) => {
  describe('pubsub api', () => {
    let pubsub

    // Create pubsub router
    beforeEach(async () => {
      [pubsub] = await common.setup(1)
    })

    afterEach(async () => {
      sinon.restore()
      pubsub && await pubsub.stop()
      await common.teardown()
    })

    it('can start correctly', async () => {
      sinon.spy(pubsub.registrar, '_handle')
      sinon.spy(pubsub.registrar, 'register')

      await pubsub.start()

      expect(pubsub.started).to.eql(true)
      expect(pubsub.registrar._handle.callCount).to.eql(1)
      expect(pubsub.registrar.register.callCount).to.eql(1)
    })

    it('can stop correctly', async () => {
      sinon.spy(pubsub.registrar, 'unregister')

      await pubsub.start()
      await pubsub.stop()

      expect(pubsub.started).to.eql(false)
      expect(pubsub.registrar.unregister.callCount).to.eql(1)
    })

    it('can subscribe and unsubscribe correctly', async () => {
      const handler = () => {
        throw new Error('a message should not be received')
      }

      await pubsub.start()
      pubsub.subscribe(topic)
      pubsub.on('topic', handler)

      await pWaitFor(() => {
        const topics = pubsub.getTopics()
        return topics.length === 1 && topics[0] === topic
      })

      pubsub.unsubscribe(topic)

      await pWaitFor(() => !pubsub.getTopics().length)

      // Publish to guarantee the handler is not called
      await pubsub.publish(topic, data)

      await pubsub.stop()
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      const handler = (msg) => {
        expect(msg).to.not.eql(undefined)
        defer.resolve()
      }

      await pubsub.start()

      pubsub.subscribe(topic)
      pubsub.on(topic, handler)
      await pubsub.publish(topic, data)
      await defer.promise

      await pubsub.stop()
    })
  })
}

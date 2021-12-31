// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = (_) => expect.fail()

module.exports = (common) => {
  describe('emit self', () => {
    let pubsub

    describe('enabled', () => {
      before(async () => {
        [pubsub] = await common.setup(1, { emitSelf: true })
      })

      before(async () => {
        await pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub && await pubsub.stop()
        await common.teardown()
      })

      it('should emit to self on publish', () => {
        const promise = new Promise((resolve) => pubsub.once(topic, resolve))

        pubsub.publish(topic, data)

        return promise
      })
    })

    describe('disabled', () => {
      before(async () => {
        [pubsub] = await common.setup(1, { emitSelf: false })
      })

      before(async () => {
        await pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub && await pubsub.stop()
        await common.teardown()
      })

      it('should not emit to self on publish', () => {
        pubsub.once(topic, (m) => shouldNotHappen)

        pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

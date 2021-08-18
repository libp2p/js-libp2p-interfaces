/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')

const {
  createPeerId,
  mockRegistrar,
  PubsubImplementation
} = require('./utils')

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const protocol = '/pubsub/1.0.0'
const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = (_) => expect.fail()

describe('emitSelf', () => {
  let pubsub

  describe('enabled', () => {
    before(async () => {
      const peerId = await createPeerId()

      pubsub = new PubsubImplementation(protocol, {
        peerId,
        registrar: mockRegistrar
      }, { emitSelf: true })
    })

    before(() => {
      pubsub.start()
      pubsub.subscribe(topic)
    })

    after(() => {
      pubsub.stop()
    })

    it('should emit to self on publish', () => {
      const promise = new Promise((resolve) => pubsub.once(topic, resolve))

      pubsub.publish(topic, data)

      return promise
    })
  })

  describe('disabled', () => {
    before(async () => {
      const peerId = await createPeerId()

      pubsub = new PubsubImplementation(protocol, {
        peerId,
        registrar: mockRegistrar
      }, { emitSelf: false })
    })

    before(() => {
      pubsub.start()
      pubsub.subscribe(topic)
    })

    after(() => {
      pubsub.stop()
    })

    it('should not emit to self on publish', () => {
      pubsub.once(topic, (m) => shouldNotHappen)

      pubsub.publish(topic, data)

      // Wait 1 second to guarantee that self is not noticed
      return new Promise((resolve) => setTimeout(() => resolve(), 1000))
    })
  })
})

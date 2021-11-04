import { expect } from 'aegir/utils/chai.js'
import {
  createPeerId,
  mockRegistrar,
  PubsubImplementation
} from './utils/index.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import delay from 'delay'

const protocol = '/pubsub/1.0.0'
const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = () => expect.fail()

describe('emitSelf', () => {
  let pubsub: PubsubImplementation

  describe('enabled', () => {
    before(async () => {
      const peerId = await createPeerId()

      pubsub = new PubsubImplementation({
        multicodecs: [protocol],
        libp2p: {
          peerId,
          registrar: mockRegistrar
        },
        emitSelf: true
      })
    })

    before(() => {
      pubsub.start()
      pubsub.subscribe(topic)
    })

    after(() => {
      pubsub.stop()
    })

    it('should emit to self on publish', async () => {
      const promise = new Promise((resolve) => pubsub.once(topic, resolve))

      await pubsub.publish(topic, data)

      return await promise
    })
  })

  describe('disabled', () => {
    before(async () => {
      const peerId = await createPeerId()

      pubsub = new PubsubImplementation({
        multicodecs: [protocol],
        libp2p: {
          peerId,
          registrar: mockRegistrar
        },
        emitSelf: false
      })
    })

    before(() => {
      pubsub.start()
      pubsub.subscribe(topic)
    })

    after(() => {
      pubsub.stop()
    })

    it('should not emit to self on publish', async () => {
      pubsub.once(topic, () => shouldNotHappen)

      await pubsub.publish(topic, data)

      // Wait 1 second to guarantee that self is not noticed
      await delay(1000)
    })
  })
})

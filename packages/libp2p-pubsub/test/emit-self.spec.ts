import { expect } from 'aegir/utils/chai.js'
import {
  createPeerId,
  MockRegistrar,
  PubsubImplementation
} from './utils/index.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import delay from 'delay'
import { CustomEvent } from '@libp2p/interfaces'
import { Components } from '@libp2p/interfaces/components'

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
        emitSelf: true
      })
      pubsub.init(new Components({
        peerId,
        registrar: new MockRegistrar()
      }))
    })

    before(async () => {
      await pubsub.start()
      pubsub.subscribe(topic)
    })

    after(async () => {
      await pubsub.stop()
    })

    it('should emit to self on publish', async () => {
      const promise = new Promise((resolve) => pubsub.addEventListener(topic, resolve))

      pubsub.dispatchEvent(new CustomEvent<Uint8Array>(topic, { detail: data }))

      return await promise
    })
  })

  describe('disabled', () => {
    before(async () => {
      const peerId = await createPeerId()

      pubsub = new PubsubImplementation({
        multicodecs: [protocol],
        emitSelf: false
      })
      pubsub.init(new Components({
        peerId,
        registrar: new MockRegistrar()
      }))
    })

    before(async () => {
      await pubsub.start()
      pubsub.subscribe(topic)
    })

    after(async () => {
      await pubsub.stop()
    })

    it('should not emit to self on publish', async () => {
      pubsub.addEventListener(topic, () => shouldNotHappen, {
        once: true
      })

      pubsub.dispatchEvent(new CustomEvent<Uint8Array>(topic, { detail: data }))

      // Wait 1 second to guarantee that self is not noticed
      await delay(1000)
    })
  })
})

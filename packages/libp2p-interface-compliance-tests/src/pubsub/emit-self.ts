import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, PubsubOptions } from '@libp2p/interfaces/pubsub'
import type { EventMap } from './index.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = () => expect.fail()

export default (common: TestSetup<PubSub<EventMap>, Partial<PubsubOptions>>) => {
  describe('emit self', () => {
    let pubsub: PubSub<EventMap>

    describe('enabled', () => {
      before(async () => {
        pubsub = await common.setup({ emitSelf: true })
      })

      before(async () => {
        await pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await pubsub.stop()
        await common.teardown()
      })

      it('should emit to self on publish', async () => {
        const promise = new Promise((resolve) => pubsub.addEventListener(topic, resolve, {
          once: true
        }))

        void pubsub.publish(topic, data)

        return await promise
      })
    })

    describe('disabled', () => {
      before(async () => {
        pubsub = await common.setup({ emitSelf: false })
      })

      before(async () => {
        await pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await pubsub.stop()
        await common.teardown()
      })

      it('should not emit to self on publish', async () => {
        pubsub.addEventListener(topic, () => shouldNotHappen, {
          once: true
        })

        void pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return await new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

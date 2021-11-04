import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, PubsubOptions } from 'libp2p-interfaces/pubsub'

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = () => expect.fail()

export default (common: TestSetup<PubSub, Partial<PubsubOptions>>) => {
  describe('emit self', () => {
    let pubsub: PubSub

    describe('enabled', () => {
      before(async () => {
        pubsub = await common.setup({ emitSelf: true })
      })

      before(() => {
        pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub.stop()
        await common.teardown()
      })

      it('should emit to self on publish', async () => {
        const promise = new Promise((resolve) => pubsub.once(topic, resolve))

        void pubsub.publish(topic, data)

        return await promise
      })
    })

    describe('disabled', () => {
      before(async () => {
        pubsub = await common.setup({ emitSelf: false })
      })

      before(() => {
        pubsub.start()
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        pubsub.stop()
        await common.teardown()
      })

      it('should not emit to self on publish', async () => {
        pubsub.once(topic, () => shouldNotHappen)

        void pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return await new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

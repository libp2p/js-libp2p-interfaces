import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import delay from 'delay'
import type { TestSetup } from '../index.js'
import type { PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/interfaces/components'
import { createComponents } from './utils.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('pubsub api', () => {
    let pubsub: PubSub
    let components: Components

    // Create pubsub router
    beforeEach(async () => {
      components = await createComponents()

      pubsub = await common.setup({
        components,
        init: {
          emitSelf: true
        }
      })
    })

    afterEach(async () => {
      sinon.restore()
      await pubsub.stop()
      await common.teardown()
    })

    it('can start correctly', async () => {
      sinon.spy(components.getRegistrar(), 'register')

      await pubsub.start()

      expect(pubsub.isStarted()).to.equal(true)
      expect(components.getRegistrar().register).to.have.property('callCount', 1)
    })

    it('can stop correctly', async () => {
      sinon.spy(components.getRegistrar(), 'unregister')

      await pubsub.start()
      await pubsub.stop()

      expect(pubsub.isStarted()).to.equal(false)
      expect(components.getRegistrar().unregister).to.have.property('callCount', 1)
    })

    it('can subscribe and unsubscribe correctly', async () => {
      const handler = () => {
        throw new Error('a message should not be received')
      }

      await pubsub.start()
      pubsub.subscribe(topic)
      pubsub.addEventListener('message', handler)

      await pWaitFor(() => {
        const topics = pubsub.getTopics()
        return topics.length === 1 && topics[0] === topic
      })

      pubsub.removeEventListener('message', handler)
      pubsub.unsubscribe(topic)

      await pWaitFor(() => pubsub.getTopics().length === 0)

      // Publish to guarantee the handler is not called
      await pubsub.publish(topic, data)

      // handlers are called async
      await delay(100)

      await pubsub.stop()
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      await pubsub.start()

      pubsub.subscribe(topic)
      pubsub.addEventListener('message', (evt) => {
        expect(evt).to.have.nested.property('detail.topic', topic)
        expect(evt).to.have.deep.nested.property('detail.data', data)
        defer.resolve()
      })
      await pubsub.publish(topic, data)
      await defer.promise

      await pubsub.stop()
    })
  })
}

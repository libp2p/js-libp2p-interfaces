import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import delay from 'delay'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import { PubSub, TopicValidatorResult, Message } from '@libp2p/interface-pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/components'
import { createComponents } from './utils.js'
import { isStartable, start, stop } from '@libp2p/interfaces/startable'
import { mockNetwork } from '@libp2p/interface-mocks'
import type { PeerId } from '@libp2p/interface-peer-id'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('pubsub api', () => {
    let pubsub: PubSub
    let components: Components

    // Create pubsub router
    beforeEach(async () => {
      mockNetwork.reset()
      components = await createComponents()

      pubsub = components.setPubSub(await common.setup({
        components,
        init: {
          emitSelf: true
        }
      }))
    })

    afterEach(async () => {
      sinon.restore()
      await stop(components)
      await common.teardown()
      mockNetwork.reset()
    })

    it('can start correctly', async () => {
      if (!isStartable(pubsub)) {
        return
      }

      sinon.spy(components.getRegistrar(), 'register')

      await start(components)

      expect(pubsub.isStarted()).to.equal(true)
      expect(components.getRegistrar().register).to.have.property('callCount', 1)
    })

    it('can stop correctly', async () => {
      if (!isStartable(pubsub)) {
        return
      }

      sinon.spy(components.getRegistrar(), 'unregister')

      await start(components)
      await stop(components)

      expect(pubsub.isStarted()).to.equal(false)
      expect(components.getRegistrar().unregister).to.have.property('callCount', 1)
    })

    it('can subscribe and unsubscribe correctly', async () => {
      const handler = () => {
        throw new Error('a message should not be received')
      }

      await start(components)
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

      await stop(components)
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      await start(components)

      pubsub.subscribe(topic)
      pubsub.addEventListener('message', (evt) => {
        expect(evt).to.have.nested.property('detail.topic', topic)
        expect(evt).to.have.deep.nested.property('detail.data', data)
        defer.resolve()
      })
      await pubsub.publish(topic, data)
      await defer.promise

      await stop(components)
    })

    it('validates topic messages', async () => {
      const defer = pDefer()

      await start(components)

      pubsub.subscribe(topic)
      pubsub.topicValidators.set(topic, (peer: PeerId, message: Message) => {
        expect(peer).to.be.equal(components.getPeerId())
        expect(message).to.exist()
        expect(message).to.have.nested.property('data', data)
        expect(message).to.have.nested.property('topic', topic)
        defer.resolve()
        return TopicValidatorResult.Accept
      })
      await pubsub.publish(topic, data)
      await defer.promise

      await stop(components)
    })
  })
}

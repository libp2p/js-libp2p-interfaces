import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, Message } from '@libp2p/interfaces/pubsub'
import type { Startable } from '@libp2p/interfaces'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub & Startable>) => {
  describe('pubsub api', () => {
    let pubsub: PubSub & Startable

    // Create pubsub router
    beforeEach(async () => {
      pubsub = await common.setup()
    })

    afterEach(async () => {
      sinon.restore()
      await pubsub.stop()
      await common.teardown()
    })

    it('can start correctly', async () => {
      sinon.spy(pubsub.registrar, 'register')

      await pubsub.start()

      expect(pubsub.started).to.eql(true)
      expect(pubsub.registrar.register).to.have.property('callCount', 1)
    })

    it('can stop correctly', async () => {
      sinon.spy(pubsub.registrar, 'unregister')

      await pubsub.start()
      await pubsub.stop()

      expect(pubsub.started).to.eql(false)
      expect(pubsub.registrar.unregister).to.have.property('callCount', 1)
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

      await pWaitFor(() => pubsub.getTopics().length === 0)

      // Publish to guarantee the handler is not called
      await pubsub.publish(topic, data)

      await pubsub.stop()
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      const handler = (msg: Message) => {
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

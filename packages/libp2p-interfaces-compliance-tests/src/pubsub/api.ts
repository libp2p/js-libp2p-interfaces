import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub } from 'libp2p-interfaces/pubsub'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub>) => {
  describe('pubsub api', () => {
    let pubsub: PubSub

    // Create pubsub router
    beforeEach(async () => {
      pubsub = await common.setup()
    })

    afterEach(async () => {
      sinon.restore()
      pubsub.stop()
      await common.teardown()
    })

    it('can start correctly', () => {
      sinon.spy(pubsub.registrar, 'register')

      pubsub.start()

      expect(pubsub.started).to.eql(true)
      expect(pubsub.registrar.register).to.have.property('callCount', 1)
    })

    it('can stop correctly', () => {
      sinon.spy(pubsub.registrar, 'unregister')

      pubsub.start()
      pubsub.stop()

      expect(pubsub.started).to.eql(false)
      expect(pubsub.registrar.unregister).to.have.property('callCount', 1)
    })

    it('can subscribe and unsubscribe correctly', async () => {
      const handler = () => {
        throw new Error('a message should not be received')
      }

      pubsub.start()
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

      pubsub.stop()
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      const handler = (msg: Uint8Array) => {
        expect(msg).to.not.eql(undefined)
        defer.resolve()
      }

      pubsub.start()

      pubsub.subscribe(topic)
      pubsub.on(topic, handler)
      await pubsub.publish(topic, data)
      await defer.promise

      pubsub.stop()
    })
  })
}

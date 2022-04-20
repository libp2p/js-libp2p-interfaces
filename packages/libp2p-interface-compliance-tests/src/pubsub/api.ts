import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { mockRegistrar } from '../mocks/registrar.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import delay from 'delay'
import type { TestSetup } from '../index.js'
import type { PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Registrar } from '@libp2p/interfaces/registrar'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import { Components } from '@libp2p/interfaces/components'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSubBaseProtocol, PubSubArgs>) => {
  describe('pubsub api', () => {
    let pubsub: PubSub
    let registrar: Registrar

    // Create pubsub router
    beforeEach(async () => {
      registrar = mockRegistrar()

      pubsub = await common.setup({
        components: new Components({
          peerId: await createEd25519PeerId(),
          registrar
        }),
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
      sinon.spy(registrar, 'register')

      await pubsub.start()

      expect(pubsub.isStarted()).to.equal(true)
      expect(registrar.register).to.have.property('callCount', 1)
    })

    it('can stop correctly', async () => {
      sinon.spy(registrar, 'unregister')

      await pubsub.start()
      await pubsub.stop()

      expect(pubsub.isStarted()).to.equal(false)
      expect(registrar.unregister).to.have.property('callCount', 1)
    })

    it('can subscribe and unsubscribe correctly', async () => {
      const handler = () => {
        throw new Error('a message should not be received')
      }

      await pubsub.start()
      pubsub.addEventListener('message', handler)

      await pWaitFor(() => {
        const topics = pubsub.getTopics()
        return topics.length === 1 && topics[0] === topic
      })

      pubsub.removeEventListener('message', handler)

      await pWaitFor(() => pubsub.getTopics().length === 0)

      // Publish to guarantee the handler is not called
      pubsub.publish(topic, data)

      // handlers are called async
      await delay(100)

      await pubsub.stop()
    })

    it('can subscribe and publish correctly', async () => {
      const defer = pDefer()

      await pubsub.start()

      pubsub.addEventListener('message', (evt) => {
        expect(evt.type).to.equal(topic)
        const msg = evt.detail
        expect(msg).to.not.eql(undefined)
        defer.resolve()
      })
      pubsub.publish(topic, data)
      await defer.promise

      await pubsub.stop()
    })
  })
}

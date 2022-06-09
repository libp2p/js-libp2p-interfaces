import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { Message, PubSub } from '@libp2p/interface-pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/components'
import { start, stop } from '@libp2p/interfaces/startable'
import { pEvent } from 'p-event'
import { createComponents } from './utils.js'
import { mockNetwork } from '@libp2p/interface-mocks'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('messages', () => {
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
      await start(components)
    })

    afterEach(async () => {
      sinon.restore()
      await stop(components)
      await common.teardown()
      mockNetwork.reset()
    })

    it('should emit normalized signed messages on publish', async () => {
      const eventPromise = pEvent<'message', CustomEvent<Message>>(pubsub, 'message')

      pubsub.globalSignaturePolicy = 'StrictSign'
      pubsub.subscribe(topic)
      await pubsub.publish(topic, data)

      const event = await eventPromise
      const message = event.detail

      expect(message.from.toString()).to.equal(components.getPeerId().toString())
      expect(message.sequenceNumber).to.not.eql(undefined)
      expect(message.key).to.not.eql(undefined)
      expect(message.signature).to.not.eql(undefined)
    })
  })
}

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { Message, PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/interfaces/components'
import { start, stop } from '../index.js'
import { pEvent } from 'p-event'
import { createComponents } from './utils.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('messages', () => {
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
      await start(pubsub)
    })

    afterEach(async () => {
      sinon.restore()
      await stop(pubsub)
      await common.teardown()
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

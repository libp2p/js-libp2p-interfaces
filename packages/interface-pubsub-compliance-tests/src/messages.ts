import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { Message, PubSub } from '@libp2p/interface-pubsub'
import type { PubSubArgs, PubSubComponents } from './index.js'
import { start, stop } from '@libp2p/interfaces/startable'
import { pEvent } from 'p-event'
import { createComponents } from './utils.js'
import { mockNetwork } from '@libp2p/interface-mocks'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>): void => {
  describe('messages', () => {
    let pubsub: PubSub
    let components: PubSubComponents

    // Create pubsub router
    beforeEach(async () => {
      mockNetwork.reset()
      components = await createComponents()

      pubsub = components.pubsub = await common.setup({
        components,
        init: {
          emitSelf: true
        }
      })
      await start(...Object.values(components))
    })

    afterEach(async () => {
      sinon.restore()
      await stop(...Object.values(components))
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

      if (message.type === 'signed') {
        expect(message.from.toString()).to.equal(components.peerId.toString())
        expect(message.sequenceNumber).to.not.eql(undefined)
        expect(message.key).to.not.eql(undefined)
        expect(message.signature).to.not.eql(undefined)
      }
    })
  })
}

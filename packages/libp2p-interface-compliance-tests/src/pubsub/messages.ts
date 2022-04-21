import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { mockRegistrar } from '../mocks/registrar.js'
import type { TestSetup } from '../index.js'
import type { Message, PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import { Components } from '@libp2p/interfaces/components'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import { start, stop } from '../index.js'
import { pEvent } from 'p-event'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('messages', () => {
    let peerId: PeerId
    let pubsub: PubSub

    // Create pubsub router
    beforeEach(async () => {
      peerId = await createEd25519PeerId()

      pubsub = await common.setup({
        components: new Components({
          peerId,
          registrar: mockRegistrar()
        }),
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
      pubsub.globalSignaturePolicy = 'StrictSign'
      pubsub.publish(topic, data)

      const event = await pEvent<'message', CustomEvent<Message>>(pubsub, 'message')
      const message = event.detail

      expect(message.from.toString()).to.equal(peerId.toString())
      expect(message.sequenceNumber).to.not.eql(undefined)
      expect(message.key).to.not.eql(undefined)
      expect(message.signature).to.not.eql(undefined)
    })
  })
}

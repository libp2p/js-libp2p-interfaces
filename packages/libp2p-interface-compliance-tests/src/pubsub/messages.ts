import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { noSignMsgId } from '@libp2p/pubsub/utils'
import { PeerStreams } from '@libp2p/pubsub/peer-streams'
import { mockRegistrar } from '../mocks/registrar.js'
import pDefer from 'p-defer'
import delay from 'delay'
import pWaitFor from 'p-wait-for'
import type { TestSetup } from '../index.js'
import type { PubSubRPC } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import { Components } from '@libp2p/interfaces/components'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import { start, stop } from '../index.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSubBaseProtocol, PubSubArgs>) => {
  describe('messages', () => {
    let peerId: PeerId
    let pubsub: PubSubBaseProtocol

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

      const spy = sinon.spy(pubsub, 'publishMessage')

      await pubsub.publish(topic, data)

      await pWaitFor(async () => {
        return spy.callCount === 1
      })

      expect(spy).to.have.property('callCount', 1)

      const [from, messageToEmit] = spy.getCall(0).args

      expect(from.toString()).to.equal(peerId.toString())
      expect(messageToEmit.sequenceNumber).to.not.eql(undefined)
      expect(messageToEmit.key).to.not.eql(undefined)
      expect(messageToEmit.signature).to.not.eql(undefined)
    })

    it('should drop unsigned messages', async () => {
      const publishSpy = sinon.spy(pubsub, 'publishMessage')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await createEd25519PeerId(),
        protocol: 'test'
      })
      const rpc: PubSubRPC = {
        subscriptions: [],
        messages: [{
          from: peerStream.id.toBytes(),
          data,
          sequenceNumber: await noSignMsgId(data),
          topic: topic
        }]
      }

      pubsub.subscribe(topic)

      await pubsub.processRpc(peerStream.id, peerStream, rpc)

      // message should not be delivered
      await delay(1000)

      expect(publishSpy).to.have.property('called', false)
    })

    it('should not drop unsigned messages if strict signing is disabled', async () => {
      pubsub.globalSignaturePolicy = 'StrictNoSign'

      const publishSpy = sinon.spy(pubsub, 'publishMessage')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await createEd25519PeerId(),
        protocol: 'test'
      })

      const rpc: PubSubRPC = {
        subscriptions: [],
        messages: [{
          from: peerStream.id.toBytes(),
          data,
          topic
        }]
      }

      pubsub.subscribe(topic)

      const deferred = pDefer()

      pubsub.addEventListener('message', (evt) => {
        if (evt.detail.topic === topic) {
          deferred.resolve()
        }
      })

      await pubsub.processRpc(peerStream.id, peerStream, rpc)

      // await message delivery
      await deferred.promise

      expect(pubsub.validate).to.have.property('callCount', 1)
      expect(publishSpy).to.have.property('callCount', 1)
    })
  })
}

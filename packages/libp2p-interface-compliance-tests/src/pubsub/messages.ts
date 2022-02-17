import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { noSignMsgId } from '@libp2p/pubsub/utils'
import { PeerStreams } from '@libp2p/pubsub/peer-streams'
import type { TestSetup } from '../index.js'
import type { PubSub, PubSubOptions, RPC } from '@libp2p/interfaces/pubsub'
import type { EventMap } from './index.js'
import { mockRegistrar } from '../mocks/registrar.js'
import pDefer from 'p-defer'
import delay from 'delay'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub<EventMap>, PubSubOptions>) => {
  describe('messages', () => {
    let pubsub: PubSub<EventMap>

    // Create pubsub router
    beforeEach(async () => {
      pubsub = await common.setup({
        peerId: await createEd25519PeerId(),
        registrar: mockRegistrar(),
        emitSelf: true
      })
      await pubsub.start()
    })

    afterEach(async () => {
      sinon.restore()
      await pubsub.stop()
      await common.teardown()
    })

    it('should emit normalized signed messages on publish', async () => {
      pubsub.globalSignaturePolicy = 'StrictSign'

      const spy = sinon.spy(pubsub, 'emitMessage')

      await pubsub.publish(topic, data)

      expect(spy).to.have.property('callCount', 1)

      const [messageToEmit] = spy.getCall(0).args

      expect(messageToEmit.seqno).to.not.eql(undefined)
      expect(messageToEmit.key).to.not.eql(undefined)
      expect(messageToEmit.signature).to.not.eql(undefined)
    })

    it('should drop unsigned messages', async () => {
      const emitMessageSpy = sinon.spy(pubsub, 'emitMessage')
      // @ts-expect-error protected abstract field
      const publishSpy = sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await createEd25519PeerId(),
        protocol: 'test'
      })
      const rpc: RPC = {
        subscriptions: [],
        msgs: [{
          from: peerStream.id.toBytes(),
          data,
          seqno: await noSignMsgId(data),
          topicIDs: [topic]
        }]
      }

      pubsub.subscribe(topic)

      await pubsub.processRpc(peerStream.id, peerStream, rpc)

      // message should not be delivered
      await delay(1000)

      expect(pubsub.validate).to.have.property('callCount', 1)
      expect(emitMessageSpy).to.have.property('called', false)
      expect(publishSpy).to.have.property('called', false)
    })

    it('should not drop unsigned messages if strict signing is disabled', async () => {
      pubsub.globalSignaturePolicy = 'StrictNoSign'

      const emitMessageSpy = sinon.spy(pubsub, 'emitMessage')
      // @ts-expect-error protected field
      const publishSpy = sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await createEd25519PeerId(),
        protocol: 'test'
      })

      const rpc: RPC = {
        subscriptions: [],
        msgs: [{
          from: peerStream.id.toBytes(),
          data,
          topicIDs: [topic]
        }]
      }

      pubsub.subscribe(topic)

      const deferred = pDefer()

      await pubsub.processRpc(peerStream.id, peerStream, rpc)

      pubsub.addEventListener(topic, () => {
        deferred.resolve()
      })

      // await message delivery
      await deferred.promise

      expect(pubsub.validate).to.have.property('callCount', 1)
      expect(emitMessageSpy).to.have.property('callCount', 1)
      expect(publishSpy).to.have.property('callCount', 1)
    })
  })
}

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import * as PeerIdFactory from 'libp2p-peer-id-factory'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import * as utils from 'libp2p-pubsub/utils'
import { PeerStreams } from 'libp2p-pubsub/peer-streams'
import type { TestSetup } from '../index.js'
import type { PubSub } from 'libp2p-interfaces/pubsub'
import type { Startable } from 'libp2p-interfaces'

const topic = 'foo'
const data = uint8ArrayFromString('bar')

export default (common: TestSetup<PubSub & Startable>) => {
  describe('messages', () => {
    let pubsub: PubSub & Startable

    // Create pubsub router
    beforeEach(async () => {
      pubsub = await common.setup()
      await pubsub.start()
    })

    afterEach(async () => {
      sinon.restore()
      await pubsub.stop()
      await common.teardown()
    })

    it('should emit normalized signed messages on publish', async () => {
      pubsub.globalSignaturePolicy = 'StrictSign'
      // @ts-expect-error protected field
      sinon.spy(pubsub, '_emitMessage')

      await pubsub.publish(topic, data)
      // @ts-expect-error protected field
      expect(pubsub._emitMessage.callCount).to.eql(1)
      // @ts-expect-error protected field
      const [messageToEmit] = pubsub._emitMessage.getCall(0).args

      expect(messageToEmit.seqno).to.not.eql(undefined)
      expect(messageToEmit.key).to.not.eql(undefined)
      expect(messageToEmit.signature).to.not.eql(undefined)
    })

    it('should drop unsigned messages', async () => {
      // @ts-expect-error protected field
      sinon.spy(pubsub, '_emitMessage')
      // @ts-expect-error protected field
      sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await PeerIdFactory.createEd25519PeerId(),
        protocol: 'test'
      })
      const rpc = {
        subscriptions: [],
        msgs: [{
          receivedFrom: peerStream.id.toString(),
          from: peerStream.id.toBytes(),
          data,
          seqno: utils.randomSeqno(),
          topicIDs: [topic]
        }]
      }

      pubsub.subscribe(topic)
      // @ts-expect-error protected field
      await pubsub._processRpc(peerStream.id.toString(), peerStream, rpc)

      expect(pubsub.validate).to.have.property('callCount', 1)
      // @ts-expect-error protected field
      expect(pubsub._emitMessage).to.have.property('called', false)
      // @ts-expect-error protected field
      expect(pubsub._publish).to.have.property('called', false)
    })

    it('should not drop unsigned messages if strict signing is disabled', async () => {
      pubsub.globalSignaturePolicy = 'StrictNoSign'
      // @ts-expect-error protected field
      sinon.spy(pubsub, '_emitMessage')
      // @ts-expect-error protected field
      sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await PeerIdFactory.createEd25519PeerId(),
        protocol: 'test'
      })

      const rpc = {
        subscriptions: [],
        msgs: [{
          data,
          topicIDs: [topic]
        }]
      }

      pubsub.subscribe(topic)
      // @ts-expect-error protected field
      await pubsub._processRpc(peerStream.id.toString(), peerStream, rpc)

      expect(pubsub.validate).to.have.property('callCount', 1)
      // @ts-expect-error protected field
      expect(pubsub._emitMessage).to.have.property('called', 1)
      // @ts-expect-error protected field
      expect(pubsub._publish).to.have.property('called', 1)
    })
  })
}

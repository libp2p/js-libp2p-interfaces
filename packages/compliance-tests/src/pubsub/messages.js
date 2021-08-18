// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const PeerId = require('peer-id')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const { utils } = require('libp2p-interfaces/src/pubsub')
const PeerStreams = require('libp2p-interfaces/src/pubsub/peer-streams')
const { SignaturePolicy } = require('libp2p-interfaces/src/pubsub/signature-policy')

const topic = 'foo'
const data = uint8ArrayFromString('bar')

module.exports = (common) => {
  describe('messages', () => {
    let pubsub

    // Create pubsub router
    beforeEach(async () => {
      [pubsub] = await common.setup(1)
      pubsub.start()
    })

    afterEach(async () => {
      sinon.restore()
      pubsub && pubsub.stop()
      await common.teardown()
    })

    it('should emit normalized signed messages on publish', async () => {
      pubsub.globalSignaturePolicy = SignaturePolicy.StrictSign
      sinon.spy(pubsub, '_emitMessage')

      await pubsub.publish(topic, data)
      expect(pubsub._emitMessage.callCount).to.eql(1)

      const [messageToEmit] = pubsub._emitMessage.getCall(0).args

      expect(messageToEmit.seqno).to.not.eql(undefined)
      expect(messageToEmit.key).to.not.eql(undefined)
      expect(messageToEmit.signature).to.not.eql(undefined)
    })

    it('should drop unsigned messages', async () => {
      sinon.spy(pubsub, '_emitMessage')
      sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await PeerId.create(),
        protocol: 'test'
      })
      const rpc = {
        subscriptions: [],
        msgs: [{
          receivedFrom: peerStream.id.toB58String(),
          from: peerStream.id.toBytes(),
          data,
          seqno: utils.randomSeqno(),
          topicIDs: [topic]
        }]
      }

      pubsub.subscribe(topic)
      await pubsub._processRpc(peerStream.id.toB58String(), peerStream, rpc)

      expect(pubsub.validate.callCount).to.eql(1)
      expect(pubsub._emitMessage.called).to.eql(false)
      expect(pubsub._publish.called).to.eql(false)
    })

    it('should not drop unsigned messages if strict signing is disabled', async () => {
      pubsub.globalSignaturePolicy = SignaturePolicy.StrictNoSign
      sinon.spy(pubsub, '_emitMessage')
      sinon.spy(pubsub, '_publish')
      sinon.spy(pubsub, 'validate')

      const peerStream = new PeerStreams({
        id: await PeerId.create(),
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
      await pubsub._processRpc(peerStream.id.toB58String(), peerStream, rpc)

      expect(pubsub.validate.callCount).to.eql(1)
      expect(pubsub._emitMessage.called).to.eql(true)
      expect(pubsub._publish.called).to.eql(true)
    })
  })
}

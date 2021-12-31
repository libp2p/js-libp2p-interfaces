/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const pWaitFor = require('p-wait-for')

const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const PeerStreams = require('../../src/pubsub/peer-streams')
const {
  createPeerId,
  createMockRegistrar,
  ConnectionPair,
  mockRegistrar,
  PubsubImplementation
} = require('./utils')

const protocol = '/pubsub/1.0.0'
const topic = 'test-topic'
const message = uint8ArrayFromString('hello')

describe('pubsub base implementation', () => {
  describe('publish', () => {
    let pubsub

    beforeEach(async () => {
      const peerId = await createPeerId()
      pubsub = new PubsubImplementation(protocol, {
        peerId: peerId,
        registrar: mockRegistrar
      })
    })

    afterEach(async () => {
      await pubsub.stop()
    })

    it('calls _publish for router to forward messages', async () => {
      sinon.spy(pubsub, '_publish')

      await pubsub.start()
      await pubsub.publish(topic, message)

      expect(pubsub._publish.callCount).to.eql(1)

      await pubsub.stop()
    })

    it('should sign messages on publish', async () => {
      sinon.spy(pubsub, '_publish')

      await pubsub.start()
      await pubsub.publish(topic, message)

      // Get the first message sent to _publish, and validate it
      const signedMessage = pubsub._publish.getCall(0).lastArg
      try {
        await pubsub.validate(signedMessage)
      } catch (/** @type {any} */ e) {
        expect.fail('validation should not throw')
      }

      await pubsub.stop()
    })
  })

  describe('subscribe', () => {
    describe('basics', () => {
      let pubsub

      beforeEach(async () => {
        const peerId = await createPeerId()
        pubsub = new PubsubImplementation(protocol, {
          peerId: peerId,
          registrar: mockRegistrar
        })
        await pubsub.start()
      })

      afterEach(async () => {
        await pubsub.stop()
      })

      it('should add subscription', () => {
        pubsub.subscribe(topic)

        expect(pubsub.subscriptions.size).to.eql(1)
        expect(pubsub.subscriptions.has(topic)).to.be.true()
      })
    })

    describe('two nodes', () => {
      let pubsubA, pubsubB
      let peerIdA, peerIdB
      const registrarRecordA = {}
      const registrarRecordB = {}

      beforeEach(async () => {
        peerIdA = await createPeerId()
        peerIdB = await createPeerId()

        pubsubA = new PubsubImplementation(protocol, {
          peerId: peerIdA,
          registrar: createMockRegistrar(registrarRecordA)
        })
        pubsubB = new PubsubImplementation(protocol, {
          peerId: peerIdB,
          registrar: createMockRegistrar(registrarRecordB)
        })
      })

      // start pubsub and connect nodes
      beforeEach(async () => {
        await pubsubA.start()
        await pubsubB.start()

        const onConnectA = registrarRecordA[protocol].onConnect
        const handlerB = registrarRecordB[protocol].handler

        // Notice peers of connection
        const [c0, c1] = ConnectionPair()

        await onConnectA(peerIdB, c0)
        await handlerB({
          protocol,
          stream: c1.stream,
          connection: {
            remotePeer: peerIdA
          }
        })
      })

      afterEach(async () => {
        await pubsubA.stop()
        await pubsubB.stop()
      })

      it('should send subscribe message to connected peers', async () => {
        sinon.spy(pubsubA, '_sendSubscriptions')
        sinon.spy(pubsubB, '_processRpcSubOpt')

        pubsubA.subscribe(topic)

        // Should send subscriptions to a peer
        expect(pubsubA._sendSubscriptions.callCount).to.eql(1)

        // Other peer should receive subscription message
        await pWaitFor(() => {
          const subscribers = pubsubB.getSubscribers(topic)

          return subscribers.length === 1
        })
        expect(pubsubB._processRpcSubOpt.callCount).to.eql(1)
      })
    })
  })

  describe('unsubscribe', () => {
    describe('basics', () => {
      let pubsub

      beforeEach(async () => {
        const peerId = await createPeerId()
        pubsub = new PubsubImplementation(protocol, {
          peerId: peerId,
          registrar: mockRegistrar
        })
        pubsub.start()
      })

      afterEach(() => pubsub.stop())

      it('should remove all subscriptions for a topic', () => {
        pubsub.subscribe(topic, (msg) => {})
        pubsub.subscribe(topic, (msg) => {})

        expect(pubsub.subscriptions.size).to.eql(1)

        pubsub.unsubscribe(topic)

        expect(pubsub.subscriptions.size).to.eql(0)
      })
    })

    describe('two nodes', () => {
      let pubsubA, pubsubB
      let peerIdA, peerIdB
      const registrarRecordA = {}
      const registrarRecordB = {}

      beforeEach(async () => {
        peerIdA = await createPeerId()
        peerIdB = await createPeerId()

        pubsubA = new PubsubImplementation(protocol, {
          peerId: peerIdA,
          registrar: createMockRegistrar(registrarRecordA)
        })
        pubsubB = new PubsubImplementation(protocol, {
          peerId: peerIdB,
          registrar: createMockRegistrar(registrarRecordB)
        })
      })

      // start pubsub and connect nodes
      beforeEach(async () => {
        await pubsubA.start()
        await pubsubB.start()

        const onConnectA = registrarRecordA[protocol].onConnect
        const handlerB = registrarRecordB[protocol].handler

        // Notice peers of connection
        const [c0, c1] = ConnectionPair()

        await onConnectA(peerIdB, c0)
        await handlerB({
          protocol,
          stream: c1.stream,
          connection: {
            remotePeer: peerIdA
          }
        })
      })

      afterEach(async () => {
        await pubsubA.stop()
        await pubsubB.stop()
      })

      it('should send unsubscribe message to connected peers', async () => {
        sinon.spy(pubsubA, '_sendSubscriptions')
        sinon.spy(pubsubB, '_processRpcSubOpt')

        pubsubA.subscribe(topic)
        // Should send subscriptions to a peer
        expect(pubsubA._sendSubscriptions.callCount).to.eql(1)

        // Other peer should receive subscription message
        await pWaitFor(() => {
          const subscribers = pubsubB.getSubscribers(topic)

          return subscribers.length === 1
        })
        expect(pubsubB._processRpcSubOpt.callCount).to.eql(1)

        // Unsubscribe
        pubsubA.unsubscribe(topic)
        // Should send subscriptions to a peer
        expect(pubsubA._sendSubscriptions.callCount).to.eql(2)

        // Other peer should receive subscription message
        await pWaitFor(() => {
          const subscribers = pubsubB.getSubscribers(topic)

          return subscribers.length === 0
        })
        expect(pubsubB._processRpcSubOpt.callCount).to.eql(2)
      })

      it('should not send unsubscribe message to connected peers if not subscribed', () => {
        sinon.spy(pubsubA, '_sendSubscriptions')
        sinon.spy(pubsubB, '_processRpcSubOpt')

        // Unsubscribe
        pubsubA.unsubscribe(topic)

        // Should send subscriptions to a peer
        expect(pubsubA._sendSubscriptions.callCount).to.eql(0)
      })
    })
  })

  describe('getTopics', () => {
    let peerId
    let pubsub

    beforeEach(async () => {
      peerId = await createPeerId()
      pubsub = new PubsubImplementation(protocol, {
        peerId: peerId,
        registrar: mockRegistrar
      })
      await pubsub.start()
    })

    afterEach(() => pubsub.stop())

    it('returns the subscribed topics', () => {
      let subsTopics = pubsub.getTopics()
      expect(subsTopics).to.have.lengthOf(0)

      pubsub.subscribe(topic)

      subsTopics = pubsub.getTopics()
      expect(subsTopics).to.have.lengthOf(1)
      expect(subsTopics[0]).to.eql(topic)
    })
  })

  describe('getSubscribers', () => {
    let peerId
    let pubsub

    beforeEach(async () => {
      peerId = await createPeerId()
      pubsub = new PubsubImplementation(protocol, {
        peerId: peerId,
        registrar: mockRegistrar
      })
    })

    afterEach(() => pubsub.stop())

    it('should fail if pubsub is not started', () => {
      const topic = 'topic-test'

      try {
        pubsub.getSubscribers(topic)
      } catch (/** @type {any} */ err) {
        expect(err).to.exist()
        expect(err.code).to.eql('ERR_NOT_STARTED_YET')
        return
      }
      throw new Error('should fail if pubsub is not started')
    })

    it('should fail if no topic is provided', async () => {
      // start pubsub
      await pubsub.start()

      try {
        pubsub.getSubscribers()
      } catch (/** @type {any} */ err) {
        expect(err).to.exist()
        expect(err.code).to.eql('ERR_NOT_VALID_TOPIC')
        return
      }
      throw new Error('should fail if no topic is provided')
    })

    it('should get peer subscribed to one topic', async () => {
      const topic = 'topic-test'

      // start pubsub
      await pubsub.start()

      let peersSubscribed = pubsub.getSubscribers(topic)
      expect(peersSubscribed).to.be.empty()

      // Set mock peer subscribed
      const peer = new PeerStreams({ id: peerId })
      const id = peer.id.toB58String()

      pubsub.topics.set(topic, new Set([id]))
      pubsub.peers.set(id, peer)

      peersSubscribed = pubsub.getSubscribers(topic)

      expect(peersSubscribed).to.not.be.empty()
      expect(peersSubscribed[0]).to.eql(id)

      await pubsub.stop()
    })
  })
})

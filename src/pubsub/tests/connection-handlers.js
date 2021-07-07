// @ts-nocheck interface tests
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')
const pDefer = require('p-defer')
const pWaitFor = require('p-wait-for')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')

const { expectSet } = require('./utils')

module.exports = (common) => {
  describe('pubsub connection handlers', () => {
    let psA, psB

    describe('nodes send state on connection', () => {
      // Create pubsub nodes and connect them
      before(async () => {
        [psA, psB] = await common.setup(2)

        expect(psA.peers.size).to.be.eql(0)
        expect(psB.peers.size).to.be.eql(0)

        // Start pubsub
        psA.start()
        psB.start()
      })

      // Make subscriptions prior to nodes connected
      before(() => {
        psA.subscribe('Za')
        psB.subscribe('Zb')

        expect(psA.peers.size).to.equal(0)
        expectSet(psA.subscriptions, ['Za'])
        expect(psB.peers.size).to.equal(0)
        expectSet(psB.subscriptions, ['Zb'])
      })

      after(async () => {
        sinon.restore()
        await common.teardown()
      })

      it('existing subscriptions are sent upon peer connection', async function () {
        this.timeout(10e3)

        await Promise.all([
          psA._libp2p.dial(psB.peerId),
          new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
          new Promise((resolve) => psB.once('pubsub:subscription-change', resolve))
        ])

        expect(psA.peers.size).to.equal(1)
        expect(psB.peers.size).to.equal(1)

        expectSet(psA.subscriptions, ['Za'])
        expectSet(psB.topics.get('Za'), [psA.peerId.toB58String()])

        expectSet(psB.subscriptions, ['Zb'])
        expectSet(psA.topics.get('Zb'), [psB.peerId.toB58String()])
      })
    })

    describe('pubsub started before connect', () => {
      // Create pubsub nodes and start them
      beforeEach(async () => {
        [psA, psB] = await common.setup(2)

        psA.start()
        psB.start()
      })

      afterEach(async () => {
        sinon.restore()

        await common.teardown()
      })

      it('should get notified of connected peers on dial', async () => {
        const connection = await psA._libp2p.dial(psB.peerId)
        expect(connection).to.exist()

        return Promise.all([
          pWaitFor(() => psA.peers.size === 1),
          pWaitFor(() => psB.peers.size === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        await psA._libp2p.dial(psB.peerId)

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.on(topic, (msg) => {
          expect(msg.data).to.equalBytes(data)
          defer.resolve()
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.includes(psA.peerId.toB58String())
        })
        psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub started after connect', () => {
      // Create pubsub nodes
      beforeEach(async () => {
        [psA, psB] = await common.setup(2)
      })

      afterEach(async () => {
        sinon.restore()

        psA && psA.stop()
        psB && psB.stop()

        await common.teardown()
      })

      it('should get notified of connected peers after starting', async () => {
        const connection = await psA._libp2p.dial(psB.peerId)
        expect(connection).to.exist()
        expect(psA.peers.size).to.be.eql(0)
        expect(psB.peers.size).to.be.eql(0)

        psA.start()
        psB.start()

        return Promise.all([
          pWaitFor(() => psA.peers.size === 1),
          pWaitFor(() => psB.peers.size === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        await psA._libp2p.dial(psB.peerId)

        psA.start()
        psB.start()

        await Promise.all([
          pWaitFor(() => psA.peers.size === 1),
          pWaitFor(() => psB.peers.size === 1)
        ])

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.on(topic, (msg) => {
          expect(msg.data).to.equalBytes(data)
          defer.resolve()
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.includes(psA.peerId.toB58String())
        })
        psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub with intermittent connections', () => {
      // Create pubsub nodes and start them
      beforeEach(async () => {
        [psA, psB] = await common.setup(2)

        psA.start()
        psB.start()
      })

      afterEach(async () => {
        sinon.restore()

        psA && psA.stop()
        psB && psB.stop()

        await common.teardown()
      })

      it('should receive pubsub messages after a node restart', async function () {
        this.timeout(10e3)
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')
        const psAid = psA.peerId.toB58String()

        let counter = 0
        const defer1 = pDefer()
        const defer2 = pDefer()

        await psA._libp2p.dial(psB.peerId)

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.on(topic, (msg) => {
          expect(msg.data).to.equalBytes(data)
          counter++
          counter === 1 ? defer1.resolve() : defer2.resolve()
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.includes(psAid)
        })
        psB.publish(topic, data)

        await defer1.promise

        psB.stop()
        await psB._libp2p.stop()
        await pWaitFor(() => !psA._libp2p.connectionManager.get(psB.peerId) && !psB._libp2p.connectionManager.get(psA.peerId))
        await psB._libp2p.start()
        psB.start()

        psA._libp2p.peerStore.addressBook.set(psB.peerId, psB._libp2p.multiaddrs)
        await psA._libp2p.dial(psB.peerId)

        // wait for remoteLibp2p to know about libp2p subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.includes(psAid)
        })

        psB.publish(topic, data)

        await defer2.promise
      })

      it('should handle quick reconnects with a delayed disconnect', async () => {
        // Subscribe on both
        const handlerSpy = sinon.spy()
        const topic = 'reconnect-channel'

        psA.on(topic, handlerSpy)
        psB.on(topic, handlerSpy)
        await Promise.all([
          psA.subscribe(topic),
          psB.subscribe(topic)
        ])

        // Create two connections to the remote peer
        const originalConnection = await psA._libp2p.dialer.connectToPeer(psB.peerId)
        // second connection
        await psA._libp2p.dialer.connectToPeer(psB.peerId)
        expect(psA._libp2p.connections.get(psB.peerId.toB58String())).to.have.length(2)

        // Wait for subscriptions to occur
        await pWaitFor(() => {
          return psA.getSubscribers(topic).includes(psB.peerId.toB58String()) &&
            psB.getSubscribers(topic).includes(psA.peerId.toB58String())
        })

        // Verify messages go both ways
        psA.publish(topic, uint8ArrayFromString('message1'))
        psB.publish(topic, uint8ArrayFromString('message2'))
        await pWaitFor(() => handlerSpy.callCount >= 2)
        expect(handlerSpy.args.map(([message]) => uint8ArrayToString(message.data))).to.include.members(['message1', 'message2'])

        // Disconnect the first connection (this acts as a delayed reconnect)
        const psAConnUpdateSpy = sinon.spy(psA._libp2p.connectionManager.connections, 'set')

        await originalConnection.close()
        await pWaitFor(() => psAConnUpdateSpy.callCount === 1)

        // Verify messages go both ways after the disconnect
        handlerSpy.resetHistory()
        psA.publish(topic, uint8ArrayFromString('message3'))
        psB.publish(topic, uint8ArrayFromString('message4'))
        await pWaitFor(() => handlerSpy.callCount >= 2)
        expect(handlerSpy.args.map(([message]) => uint8ArrayToString(message.data))).to.include.members(['message3', 'message4'])
      })
    })
  })
}

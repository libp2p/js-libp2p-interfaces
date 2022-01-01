import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expectSet } from './utils.js'
import type { TestSetup } from '../index.js'
import type { PubSub, Message } from 'libp2p-interfaces/pubsub'
import type { Startable } from 'libp2p-interfaces'

export default (common: TestSetup<PubSub & Startable>) => {
  describe('pubsub connection handlers', () => {
    let psA: PubSub & Startable
    let psB: PubSub & Startable

    describe('nodes send state on connection', () => {
      // Create pubsub nodes and connect them
      before(async () => {
        psA = await common.setup()
        psB = await common.setup()

        expect(psA.peers.size).to.be.eql(0)
        expect(psB.peers.size).to.be.eql(0)

        // Start pubsub
        await psA.start()
        await psB.start()
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
        await Promise.all([
          // @ts-expect-error protected fields
          psA._libp2p.dial(psB.peerId),
          new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
          new Promise((resolve) => psB.once('pubsub:subscription-change', resolve))
        ])

        expect(psA.peers.size).to.equal(1)
        expect(psB.peers.size).to.equal(1)

        expectSet(psA.subscriptions, ['Za'])

        expectSet(psB.topics.get('Za'), [psA.peerId.toString()])

        expectSet(psB.subscriptions, ['Zb'])

        expectSet(psA.topics.get('Zb'), [psB.peerId.toString()])
      })
    })

    describe('pubsub started before connect', () => {
      // Create pubsub nodes and start them
      beforeEach(async () => {
        psA = await common.setup()
        psB = await common.setup()

        await psA.start()
        await psB.start()
      })

      afterEach(async () => {
        sinon.restore()

        await common.teardown()
      })

      it('should get notified of connected peers on dial', async () => {
        // @ts-expect-error protected fields
        const connection = await psA._libp2p.dial(psB.peerId)
        expect(connection).to.exist()

        return await Promise.all([
          pWaitFor(() => psA.peers.size === 1),
          pWaitFor(() => psB.peers.size === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        // @ts-expect-error protected fields
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
          return subscribedPeers.includes(psA.peerId.toString())
        })
        void psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub started after connect', () => {
      // Create pubsub nodes
      beforeEach(async () => {
        psA = await common.setup()
        psB = await common.setup()
      })

      afterEach(async () => {
        sinon.restore()

        await psA.stop()
        await psB.stop()

        await common.teardown()
      })

      it('should get notified of connected peers after starting', async () => {
        // @ts-expect-error protected fields
        const connection = await psA._libp2p.dial(psB.peerId)
        expect(connection).to.exist()
        expect(psA.peers.size).to.be.eql(0)
        expect(psB.peers.size).to.be.eql(0)

        await psA.start()
        await psB.start()

        return await Promise.all([
          pWaitFor(() => psA.peers.size === 1),
          pWaitFor(() => psB.peers.size === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        // @ts-expect-error protected fields
        await psA._libp2p.dial(psB.peerId)

        await psA.start()
        await psB.start()

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
          return subscribedPeers.includes(psA.peerId.toString())
        })
        void psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub with intermittent connections', () => {
      // Create pubsub nodes and start them
      beforeEach(async () => {
        psA = await common.setup()
        psB = await common.setup()

        await psA.start()
        await psB.start()
      })

      afterEach(async () => {
        sinon.restore()

        await psA.stop()
        await psB.stop()

        await common.teardown()
      })

      it('should receive pubsub messages after a node restart', async function () {
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')
        const psAid = psA.peerId.toString()

        let counter = 0
        const defer1 = pDefer()
        const defer2 = pDefer()

        // @ts-expect-error protected fields
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
        void psB.publish(topic, data)

        await defer1.promise

        await psB.stop()
        // @ts-expect-error protected fields
        await psB._libp2p.stop()
        await pWaitFor(() => {
          // @ts-expect-error protected fields
          const aHasConnectionToB = psA._libp2p.connectionManager.get(psB.peerId)
          // @ts-expect-error protected fields
          const bHasConnectionToA = psB._libp2p.connectionManager.get(psA.peerId)

          return aHasConnectionToB != null && bHasConnectionToA != null
        })
        // @ts-expect-error protected fields
        await psB._libp2p.start()
        await psB.start()

        // @ts-expect-error protected fields
        psA._libp2p.peerStore.addressBook.set(psB.peerId, psB._libp2p.multiaddrs)
        // @ts-expect-error protected fields
        await psA._libp2p.dial(psB.peerId)

        // wait for remoteLibp2p to know about libp2p subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.includes(psAid)
        })

        void psB.publish(topic, data)

        await defer2.promise
      })

      it('should handle quick reconnects with a delayed disconnect', async () => {
        // Subscribe on both
        let aReceivedFirstMessageFromB = false
        let aReceivedSecondMessageFromB = false
        let bReceivedFirstMessageFromA = false
        let bReceivedSecondMessageFromA = false

        const handlerSpyA = (message: Message) => {
          const data = uint8ArrayToString(message.data)

          if (data === 'message-from-b-1') {
            aReceivedFirstMessageFromB = true
          }

          if (data === 'message-from-b-2') {
            aReceivedSecondMessageFromB = true
          }
        }
        const handlerSpyB = (message: Message) => {
          const data = uint8ArrayToString(message.data)

          if (data === 'message-from-a-1') {
            bReceivedFirstMessageFromA = true
          }

          if (data === 'message-from-a-2') {
            bReceivedSecondMessageFromA = true
          }
        }

        const topic = 'reconnect-channel'

        psA.on(topic, handlerSpyA)
        psB.on(topic, handlerSpyB)
        psA.subscribe(topic)
        psB.subscribe(topic)

        // Create two connections to the remote peer
        // @ts-expect-error protected fields
        const originalConnection = await psA._libp2p.dialer.connectToPeer(psB.peerId)
        // second connection
        // @ts-expect-error protected fields
        await psA._libp2p.dialer.connectToPeer(psB.peerId)
        // @ts-expect-error protected fields
        expect(psA._libp2p.connections.get(psB.peerId.toString())).to.have.length(2)

        // Wait for subscriptions to occur
        await pWaitFor(() => {
          return psA.getSubscribers(topic).includes(psB.peerId.toString()) &&
            psB.getSubscribers(topic).includes(psA.peerId.toString())
        })

        // Verify messages go both ways
        void psA.publish(topic, uint8ArrayFromString('message-from-a-1'))
        void psB.publish(topic, uint8ArrayFromString('message-from-b-1'))
        await pWaitFor(() => {
          return aReceivedFirstMessageFromB && bReceivedFirstMessageFromA
        })

        // Disconnect the first connection (this acts as a delayed reconnect)
        // @ts-expect-error protected fields
        const psAConnUpdateSpy = sinon.spy(psA._libp2p.connectionManager.connections, 'set')

        await originalConnection.close()
        await pWaitFor(() => psAConnUpdateSpy.callCount === 1)

        // Verify messages go both ways after the disconnect
        void psA.publish(topic, uint8ArrayFromString('message-from-a-2'))
        void psB.publish(topic, uint8ArrayFromString('message-from-b-2'))
        await pWaitFor(() => {
          return aReceivedSecondMessageFromB && bReceivedSecondMessageFromA
        })
      })
    })
  })
}

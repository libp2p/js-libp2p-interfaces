import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { Message, PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/interfaces/components'
import { start, stop } from '@libp2p/interfaces/startable'
import { createComponents } from './utils.js'
import { pEvent } from 'p-event'
import { mockNetwork } from '../mocks/connection-manager.js'

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('pubsub connection handlers', () => {
    let psA: PubSub
    let psB: PubSub
    let componentsA: Components
    let componentsB: Components

    describe('nodes send state on connection', () => {
      // Create pubsub nodes and connect them
      beforeEach(async () => {
        mockNetwork.reset()

        componentsA = await createComponents()
        componentsB = await createComponents()

        psA = componentsA.setPubSub(await common.setup({
          components: componentsA,
          init: {}
        }))

        psB = componentsB.setPubSub(await common.setup({
          components: componentsB,
          init: {}
        }))

        // Start pubsub
        await start(componentsA, componentsB)

        expect(psA.getPeers()).to.be.empty()
        expect(psB.getPeers()).to.be.empty()

        // Make subscriptions prior to nodes connected
        psA.subscribe('Za')
        psB.subscribe('Zb')

        expect(psA.getPeers()).to.be.empty()
        expect(psA.getTopics()).to.deep.equal(['Za'])
        expect(psB.getPeers()).to.be.empty()
        expect(psB.getTopics()).to.deep.equal(['Zb'])
      })

      afterEach(async () => {
        sinon.restore()
        await stop(componentsA, componentsB)
        await common.teardown()
        mockNetwork.reset()
      })

      it('existing subscriptions are sent upon peer connection', async function () {
        const subscriptionsChanged = Promise.all([
          pEvent(psA, 'subscription-change'),
          pEvent(psB, 'subscription-change')
        ])

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        await subscriptionsChanged

        expect(psA.getPeers()).to.have.lengthOf(1)
        expect(psB.getPeers()).to.have.lengthOf(1)

        expect(psA.getTopics()).to.deep.equal(['Za'])
        expect(psB.getTopics()).to.deep.equal(['Zb'])

        expect(psA.getSubscribers('Zb').map(p => p.toString())).to.deep.equal([componentsB.getPeerId().toString()])
        expect(psB.getSubscribers('Za').map(p => p.toString())).to.deep.equal([componentsA.getPeerId().toString()])
      })
    })

    describe('pubsub started before connect', () => {
      let psA: PubSub
      let psB: PubSub
      let componentsA: Components
      let componentsB: Components

      // Create pubsub nodes and start them
      beforeEach(async () => {
        mockNetwork.reset()
        componentsA = await createComponents()
        componentsB = await createComponents()

        psA = componentsA.setPubSub(await common.setup({
          components: componentsA,
          init: {}
        }))
        psB = componentsB.setPubSub(await common.setup({
          components: componentsB,
          init: {}
        }))

        await start(componentsA, componentsB)
      })

      afterEach(async () => {
        sinon.restore()
        await stop(componentsA, componentsB)
        await common.teardown()
        mockNetwork.reset()
      })

      it('should get notified of connected peers on dial', async () => {
        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        return await Promise.all([
          pWaitFor(() => psA.getPeers().length === 1),
          pWaitFor(() => psB.getPeers().length === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.subscribe(topic)
        psA.addEventListener('message', (evt) => {
          if (evt.detail.topic === topic) {
            const msg = evt.detail
            expect(msg.data).to.equalBytes(data)
            defer.resolve()
          }
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.map(p => p.toString()).includes(componentsA.getPeerId().toString()) // eslint-disable-line max-nested-callbacks
        })
        await psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub started after connect', () => {
      let psA: PubSub
      let psB: PubSub
      let componentsA: Components
      let componentsB: Components

      // Create pubsub nodes
      beforeEach(async () => {
        mockNetwork.reset()
        componentsA = await createComponents()
        componentsB = await createComponents()

        psA = componentsA.setPubSub(await common.setup({
          components: componentsA,
          init: {}
        }))
        psB = componentsB.setPubSub(await common.setup({
          components: componentsB,
          init: {}
        }))
      })

      afterEach(async () => {
        sinon.restore()
        await stop(componentsA, componentsB)
        await common.teardown()
        mockNetwork.reset()
      })

      it('should get notified of connected peers after starting', async () => {
        await start(componentsA, componentsB)

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        return await Promise.all([
          pWaitFor(() => psA.getPeers().length === 1),
          pWaitFor(() => psB.getPeers().length === 1)
        ])
      })

      it('should receive pubsub messages', async () => {
        const defer = pDefer()
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        await start(componentsA, componentsB)

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        await Promise.all([
          pWaitFor(() => psA.getPeers().length === 1),
          pWaitFor(() => psB.getPeers().length === 1)
        ])

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.subscribe(topic)
        psA.addEventListener('message', (evt) => {
          if (evt.detail.topic === topic) {
            const msg = evt.detail
            expect(msg.data).to.equalBytes(data)
            defer.resolve()
          }
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.map(p => p.toString()).includes(componentsA.getPeerId().toString()) // eslint-disable-line max-nested-callbacks
        })
        await psB.publish(topic, data)

        await defer.promise
      })
    })

    describe('pubsub with intermittent connections', () => {
      let psA: PubSub
      let psB: PubSub
      let componentsA: Components
      let componentsB: Components

      // Create pubsub nodes and start them
      beforeEach(async () => {
        mockNetwork.reset()
        componentsA = await createComponents()
        componentsB = await createComponents()

        psA = componentsA.setPubSub(await common.setup({
          components: componentsA,
          init: {}
        }))
        psB = componentsB.setPubSub(await common.setup({
          components: componentsB,
          init: {}
        }))

        await start(componentsA, componentsB)
      })

      afterEach(async () => {
        sinon.restore()
        await stop(componentsA, componentsB)
        await common.teardown()
        mockNetwork.reset()
      })

      it.skip('should receive pubsub messages after a node restart', async function () {
        const topic = 'test-topic'
        const data = uint8ArrayFromString('hey!')

        let counter = 0
        const defer1 = pDefer()
        const defer2 = pDefer()

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        let subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.not.include(topic)

        psA.subscribe(topic)
        psA.addEventListener('message', (evt) => {
          if (evt.detail.topic === topic) {
            const msg = evt.detail
            expect(msg.data).to.equalBytes(data)
            counter++
            counter === 1 ? defer1.resolve() : defer2.resolve()
          }
        })
        psA.subscribe(topic)

        subscribedTopics = psA.getTopics()
        expect(subscribedTopics).to.include(topic)

        // wait for psB to know about psA subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.map(p => p.toString()).includes(componentsA.getPeerId().toString()) // eslint-disable-line max-nested-callbacks
        })
        await psB.publish(topic, data)

        await defer1.promise

        await stop(psB)
        await pWaitFor(() => {
          // @ts-expect-error protected fields
          const aHasConnectionToB = psA._libp2p.connectionManager.get(psB.peerId)
          // @ts-expect-error protected fields
          const bHasConnectionToA = psB._libp2p.connectionManager.get(psA.peerId)

          return aHasConnectionToB != null && bHasConnectionToA != null
        })
        await start(psB)

        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        // wait for remoteLibp2p to know about libp2p subscription
        await pWaitFor(() => {
          const subscribedPeers = psB.getSubscribers(topic)
          return subscribedPeers.toString().includes(componentsA.getPeerId().toString())
        })

        await psB.publish(topic, data)

        await defer2.promise
      })

      it.skip('should handle quick reconnects with a delayed disconnect', async () => {
        // Subscribe on both
        let aReceivedFirstMessageFromB = false
        let aReceivedSecondMessageFromB = false
        let bReceivedFirstMessageFromA = false
        let bReceivedSecondMessageFromA = false
        const topic = 'reconnect-channel'

        const handlerSpyA = (evt: CustomEvent<Message>) => {
          if (evt.detail.topic !== topic) {
            return
          }

          const message = evt.detail
          const data = uint8ArrayToString(message.data)

          if (data === 'message-from-b-1') {
            aReceivedFirstMessageFromB = true
          }

          if (data === 'message-from-b-2') {
            aReceivedSecondMessageFromB = true
          }
        }
        const handlerSpyB = (evt: CustomEvent<Message>) => {
          if (evt.detail.topic !== topic) {
            return
          }

          const message = evt.detail
          const data = uint8ArrayToString(message.data)

          if (data === 'message-from-a-1') {
            bReceivedFirstMessageFromA = true
          }

          if (data === 'message-from-a-2') {
            bReceivedSecondMessageFromA = true
          }
        }

        psA.addEventListener('message', handlerSpyA)
        psB.addEventListener('message', handlerSpyB)
        psA.subscribe(topic)
        psB.subscribe(topic)

        // Create two connections to the remote peer
        // @ts-expect-error protected fields
        const originalConnection = await psA._libp2p.dialer.connectToPeer(psB.peerId)

        // second connection
        await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

        // Wait for subscriptions to occur
        await pWaitFor(() => {
          return psA.getSubscribers(topic).map(p => p.toString()).includes(componentsB.getPeerId().toString()) &&
            psB.getSubscribers(topic).map(p => p.toString()).includes(componentsA.getPeerId().toString())
        })

        // Verify messages go both ways
        await psA.publish(topic, uint8ArrayFromString('message-from-a-1'))
        await psB.publish(topic, uint8ArrayFromString('message-from-b-1'))
        await pWaitFor(() => {
          return aReceivedFirstMessageFromB && bReceivedFirstMessageFromA
        })

        // Disconnect the first connection (this acts as a delayed reconnect)
        // @ts-expect-error protected fields
        const psAConnUpdateSpy = sinon.spy(psA._libp2p.connectionManager.connections, 'set')

        await originalConnection.close()
        await pWaitFor(() => psAConnUpdateSpy.callCount === 1)

        // Verify messages go both ways after the disconnect
        await psA.publish(topic, uint8ArrayFromString('message-from-a-2'))
        await psB.publish(topic, uint8ArrayFromString('message-from-b-2'))
        await pWaitFor(() => {
          return aReceivedSecondMessageFromB && bReceivedSecondMessageFromA
        })
      })
    })
  })
}

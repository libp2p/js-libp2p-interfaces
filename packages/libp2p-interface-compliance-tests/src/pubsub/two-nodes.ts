/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createComponents, waitForSubscriptionUpdate } from './utils.js'
import type { TestSetup } from '../index.js'
import type { Message, PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/interfaces/components'
import { start, stop } from '@libp2p/interfaces/startable'
import { mockNetwork } from '../mocks/connection-manager.js'

const topic = 'foo'

function shouldNotHappen () {
  expect.fail()
}

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('pubsub with two nodes', () => {
    let psA: PubSub
    let psB: PubSub
    let componentsA: Components
    let componentsB: Components

    // Create pubsub nodes and connect them
    beforeEach(async () => {
      mockNetwork.reset()

      componentsA = await createComponents()
      componentsB = await createComponents()

      psA = componentsA.setPubSub(await common.setup({
        components: componentsA,
        init: {
          emitSelf: true
        }
      }))
      psB = componentsB.setPubSub(await common.setup({
        components: componentsB,
        init: {
          emitSelf: false
        }
      }))

      // Start pubsub and connect nodes
      await start(componentsA, componentsB)

      expect(psA.getPeers()).to.be.empty()
      expect(psB.getPeers()).to.be.empty()

      await componentsA.getConnectionManager().openConnection(componentsB.getPeerId())

      // Wait for peers to be ready in pubsub
      await pWaitFor(() => psA.getPeers().length === 1 && psB.getPeers().length === 1)
    })

    afterEach(async () => {
      sinon.restore()
      await stop(componentsA, componentsB)
      await common.teardown()
      mockNetwork.reset()
    })

    it('Subscribe to a topic in nodeA', async () => {
      const defer = pDefer()

      psB.addEventListener('subscription-change', (evt) => {
        const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
        expect(psA.getTopics()).to.deep.equal([topic])
        expect(psB.getPeers()).to.have.lengthOf(1)
        expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([componentsA.getPeerId().toString()])
        expect(changedPeerId).to.deep.equal(psB.getPeers()[0])
        expect(changedSubs).to.have.lengthOf(1)
        expect(changedSubs[0].topic).to.equal(topic)
        expect(changedSubs[0].subscribe).to.equal(true)
        defer.resolve()
      }, {
        once: true
      })
      psA.subscribe(topic)

      return await defer.promise
    })

    it('Publish to a topic in nodeA', async () => {
      const defer = pDefer()

      psA.addEventListener('message', (evt) => {
        if (evt.detail.topic === topic) {
          const msg = evt.detail
          expect(uint8ArrayToString(msg.data)).to.equal('hey')
          psB.removeEventListener('message', shouldNotHappen)
          defer.resolve()
        }
      }, {
        once: true
      })

      psA.subscribe(topic)
      psB.subscribe(topic)

      await Promise.all([
        waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
        waitForSubscriptionUpdate(psB, componentsA.getPeerId())
      ])

      await psA.publish(topic, uint8ArrayFromString('hey'))

      return await defer.promise
    })

    it('Publish to a topic in nodeB', async () => {
      const defer = pDefer()

      psA.addEventListener('message', (evt) => {
        if (evt.detail.topic !== topic) {
          return
        }

        const msg = evt.detail
        psA.addEventListener('message', (evt) => {
          if (evt.detail.topic === topic) {
            shouldNotHappen()
          }
        }, {
          once: true
        })
        expect(uint8ArrayToString(msg.data)).to.equal('banana')

        setTimeout(() => {
          psA.removeEventListener('message')
          psB.removeEventListener('message')

          defer.resolve()
        }, 100)
      }, {
        once: true
      })

      psB.addEventListener('message', shouldNotHappen)

      psA.subscribe(topic)
      psB.subscribe(topic)

      await Promise.all([
        waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
        waitForSubscriptionUpdate(psB, componentsA.getPeerId())
      ])

      await psB.publish(topic, uint8ArrayFromString('banana'))

      return await defer.promise
    })

    it('Publish 10 msg to a topic in nodeB', async () => {
      const defer = pDefer()
      let counter = 0

      psB.addEventListener('message', shouldNotHappen)
      psA.addEventListener('message', receivedMsg)

      function receivedMsg (evt: CustomEvent<Message>) {
        const msg = evt.detail
        expect(uint8ArrayToString(msg.data)).to.equal('banana')
        expect(msg.from.toString()).to.equal(componentsB.getPeerId().toString())
        expect(msg.sequenceNumber).to.be.a('BigInt')
        expect(msg.topic).to.be.equal(topic)

        if (++counter === 10) {
          psA.removeEventListener('message', receivedMsg)
          psB.removeEventListener('message', shouldNotHappen)

          defer.resolve()
        }
      }

      psA.subscribe(topic)
      psB.subscribe(topic)

      await Promise.all([
        waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
        waitForSubscriptionUpdate(psB, componentsA.getPeerId())
      ])

      await Promise.all(
        Array.from({ length: 10 }, async (_, i) => await psB.publish(topic, uint8ArrayFromString('banana')))
      )

      return await defer.promise
    })

    it('Unsubscribe from topic in nodeA', async () => {
      const defer = pDefer()
      let callCount = 0

      psB.addEventListener('subscription-change', (evt) => {
        callCount++

        if (callCount === 1) {
          // notice subscribe
          const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
          expect(psB.getPeers()).to.have.lengthOf(1)
          expect(psB.getTopics()).to.be.empty()
          expect(changedPeerId).to.deep.equal(psB.getPeers()[0])
          expect(changedSubs).to.have.lengthOf(1)
          expect(changedSubs[0].topic).to.equal(topic)
          expect(changedSubs[0].subscribe).to.equal(true)
        } else {
          // notice unsubscribe
          const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
          expect(psB.getPeers()).to.have.lengthOf(1)
          expect(psB.getTopics()).to.be.empty()
          expect(changedPeerId).to.deep.equal(psB.getPeers()[0])
          expect(changedSubs).to.have.lengthOf(1)
          expect(changedSubs[0].topic).to.equal(topic)
          expect(changedSubs[0].subscribe).to.equal(false)

          defer.resolve()
        }
      })

      psA.subscribe(topic)
      expect(psA.getTopics()).to.not.be.empty()

      psA.unsubscribe(topic)
      expect(psA.getTopics()).to.be.empty()

      return await defer.promise
    })
  })
}

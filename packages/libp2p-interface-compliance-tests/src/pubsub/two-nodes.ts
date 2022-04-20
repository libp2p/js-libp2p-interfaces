/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { connectPeers, mockRegistrar } from '../mocks/registrar.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { waitForSubscriptionUpdate } from './utils.js'
import type { TestSetup } from '../index.js'
import type { Message } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Registrar } from '@libp2p/interfaces/registrar'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import { Components } from '@libp2p/interfaces/components'
import { start, stop } from '../index.js'

const topic = 'foo'

function shouldNotHappen () {
  expect.fail()
}

export default (common: TestSetup<PubSubBaseProtocol, PubSubArgs>) => {
  describe('pubsub with two nodes', () => {
    let psA: PubSubBaseProtocol
    let psB: PubSubBaseProtocol
    let peerIdA: PeerId
    let peerIdB: PeerId
    let registrarA: Registrar
    let registrarB: Registrar

    // Create pubsub nodes and connect them
    beforeEach(async () => {
      peerIdA = await createEd25519PeerId()
      peerIdB = await createEd25519PeerId()

      registrarA = mockRegistrar()
      registrarB = mockRegistrar()

      psA = await common.setup({
        components: new Components({
          peerId: peerIdA,
          registrar: registrarA
        }),
        init: {
          emitSelf: true
        }
      })
      psB = await common.setup({
        components: new Components({
          peerId: peerIdB,
          registrar: registrarB
        }),
        init: {
          emitSelf: false
        }
      })

      // Start pubsub and connect nodes
      await start(psA, psB)

      expect(psA.getPeers()).to.be.empty()
      expect(psB.getPeers()).to.be.empty()

      await connectPeers(psA.multicodecs[0], {
        peerId: peerIdA,
        registrar: registrarA
      }, {
        peerId: peerIdB,
        registrar: registrarB
      })

      // Wait for peers to be ready in pubsub
      await pWaitFor(() => psA.getPeers().length === 1 && psB.getPeers().length === 1)
    })

    afterEach(async () => {
      sinon.restore()

      await stop(psA, psB)

      await common.teardown()
    })

    it('Subscribe to a topic in nodeA', async () => {
      const defer = pDefer()

      psB.addEventListener('subscription-change', (evt) => {
        const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
        expect(psA.getTopics()).to.deep.equal([topic])
        expect(psB.getPeers()).to.have.lengthOf(1)
        expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([peerIdA.toString()])
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
        waitForSubscriptionUpdate(psA, psB),
        waitForSubscriptionUpdate(psB, psA)
      ])

      psA.publish(topic, uint8ArrayFromString('hey'))

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
        waitForSubscriptionUpdate(psA, psB),
        waitForSubscriptionUpdate(psB, psA)
      ])

      psB.publish(topic, uint8ArrayFromString('banana'))

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
        expect(msg.from.toString()).to.equal(peerIdB.toString())
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
        waitForSubscriptionUpdate(psA, psB),
        waitForSubscriptionUpdate(psB, psA)
      ])

      Array.from({ length: 10 }, (_, i) => psB.publish(topic, uint8ArrayFromString('banana')))

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

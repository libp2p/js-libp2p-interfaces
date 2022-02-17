/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, Message, PubSubOptions } from '@libp2p/interfaces/pubsub'
import type { EventMap } from './index.js'
import { connectPeers, mockRegistrar } from '../mocks/registrar.js'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import type { Registrar } from '@libp2p/interfaces/src/registrar'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'

const topic = 'foo'

function shouldNotHappen () {
  expect.fail()
}

export default (common: TestSetup<PubSub<EventMap>, PubSubOptions>) => {
  describe('pubsub with two nodes', () => {
    let psA: PubSub<EventMap>
    let psB: PubSub<EventMap>
    let peerIdA: PeerId
    let peerIdB: PeerId
    let registrarA: Registrar
    let registrarB: Registrar

    // Create pubsub nodes and connect them
    before(async () => {
      peerIdA = await createEd25519PeerId()
      peerIdB = await createEd25519PeerId()

      registrarA = mockRegistrar()
      registrarB = mockRegistrar()

      psA = await common.setup({
        peerId: peerIdA,
        registrar: registrarA
      })
      psB = await common.setup({
        peerId: peerIdB,
        registrar: registrarB
      })

      // Start pubsub and connect nodes
      await psA.start()
      await psB.start()

      expect(psA.getPeers()).to.be.empty()
      expect(psB.getPeers()).to.be.empty()

      await connectPeers(psA.multicodecs[0], registrarA, registrarB, peerIdA, peerIdB)

      // Wait for peers to be ready in pubsub
      await pWaitFor(() => psA.getPeers().length === 1 && psB.getPeers().length === 1)
    })

    after(async () => {
      sinon.restore()

      await psA.stop()
      await psB.stop()

      await common.teardown()
    })

    it('Subscribe to a topic in nodeA', async () => {
      const defer = pDefer()

      psB.addEventListener('pubsub:subscription-change', (evt) => {
        const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
        expect(psA.getTopics()).to.deep.equal([topic])
        expect(psB.getPeers()).to.have.lengthOf(1)
        expect(psB.getSubscribers(topic)).to.deep.equal([peerIdA])
        expect(changedPeerId).to.deep.equal(psB.getPeers()[0])
        expect(changedSubs).to.have.lengthOf(1)
        expect(changedSubs[0].topicID).to.equal(topic)
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

      psA.addEventListener(topic, (evt) => {
        const msg = evt.detail
        expect(uint8ArrayToString(msg.data)).to.equal('hey')
        psB.removeEventListener(topic, shouldNotHappen)
        defer.resolve()
      }, {
        once: true
      })

      psB.addEventListener(topic, shouldNotHappen, {
        once: true
      })

      void psA.publish(topic, uint8ArrayFromString('hey'))

      return await defer.promise
    })

    it('Publish to a topic in nodeB', async () => {
      const defer = pDefer()

      psA.addEventListener(topic, (evt) => {
        const msg = evt.detail
        psA.addEventListener(topic, shouldNotHappen, {
          once: true
        })
        expect(uint8ArrayToString(msg.data)).to.equal('banana')

        setTimeout(() => {
          psA.removeEventListener(topic, shouldNotHappen)
          psB.removeEventListener(topic, shouldNotHappen)

          defer.resolve()
        }, 100)
      }, {
        once: true
      })

      psB.addEventListener(topic, shouldNotHappen, {
        once: true
      })

      void psB.publish(topic, uint8ArrayFromString('banana'))

      return await defer.promise
    })

    it('Publish 10 msg to a topic in nodeB', async () => {
      const defer = pDefer()
      let counter = 0

      psB.addEventListener(topic, shouldNotHappen, {
        once: true
      })
      psA.addEventListener(topic, receivedMsg)

      function receivedMsg (evt: CustomEvent<Message>) {
        const msg = evt.detail
        expect(uint8ArrayToString(msg.data)).to.equal('banana')
        expect(msg.from).to.deep.equal(peerIdB)
        expect(msg.seqno).to.be.a('Uint8Array')
        expect(msg.topicIDs).to.be.eql([topic])

        if (++counter === 10) {
          psA.removeEventListener(topic, receivedMsg)
          psB.removeEventListener(topic, shouldNotHappen)

          defer.resolve()
        }
      }

      Array.from({ length: 10 }, async (_, i) => await psB.publish(topic, uint8ArrayFromString('banana')))

      return await defer.promise
    })

    it('Unsubscribe from topic in nodeA', async () => {
      const defer = pDefer()

      psA.unsubscribe(topic)
      expect(psA.getTopics()).to.be.empty()

      psB.addEventListener('pubsub:subscription-change', (evt) => {
        const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
        expect(psB.getPeers()).to.have.lengthOf(1)
        expect(psB.getTopics()).to.be.empty()
        expect(changedPeerId).to.deep.equal(psB.getPeers()[0])
        expect(changedSubs).to.have.lengthOf(1)
        expect(changedSubs[0].topicID).to.equal(topic)
        expect(changedSubs[0].subscribe).to.equal(false)

        defer.resolve()
      }, {
        once: true
      })

      return await defer.promise
    })

    it('Publish to a topic:Z in nodeA nodeB', async () => {
      const defer = pDefer()

      psA.addEventListener('Z', shouldNotHappen, {
        once: true
      })
      psB.addEventListener('Z', shouldNotHappen, {
        once: true
      })

      setTimeout(() => {
        psA.removeEventListener('Z', shouldNotHappen)
        psB.removeEventListener('Z', shouldNotHappen)
        defer.resolve()
      }, 100)

      void psB.publish('Z', uint8ArrayFromString('banana'))
      void psA.publish('Z', uint8ArrayFromString('banana'))

      return await defer.promise
    })
  })
}

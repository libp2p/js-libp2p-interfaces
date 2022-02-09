/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, Message } from '@libp2p/interfaces/pubsub'
import {
  first,
  expectSet
} from './utils.js'
import type { EventMap } from './index.js'

const topic = 'foo'

function shouldNotHappen () {
  expect.fail()
}

export default (common: TestSetup<PubSub<EventMap>>) => {
  describe('pubsub with two nodes', () => {
    let psA: PubSub<EventMap>
    let psB: PubSub<EventMap>

    // Create pubsub nodes and connect them
    before(async () => {
      psA = await common.setup()
      psB = await common.setup()

      expect(psA.peers.size).to.be.eql(0)
      expect(psB.peers.size).to.be.eql(0)

      // Start pubsub and connect nodes
      await psA.start()
      await psB.start()

      // @ts-expect-error protected property
      await psA._libp2p.dial(psB.peerId)

      // Wait for peers to be ready in pubsub
      await pWaitFor(() => psA.peers.size === 1 && psB.peers.size === 1)
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
        expectSet(psA.subscriptions, [topic])
        expect(psB.peers.size).to.equal(1)
        expectSet(psB.topics.get(topic), [psA.peerId.toString()])
        expect(changedPeerId.toString()).to.equal(first(psB.peers).id.toString())
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
        expect(msg.from).to.be.eql(psB.peerId.toString())
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
      expect(psA.subscriptions.size).to.equal(0)

      psB.addEventListener('pubsub:subscription-change', (evt) => {
        const { peerId: changedPeerId, subscriptions: changedSubs } = evt.detail
        expect(psB.peers.size).to.equal(1)
        expectSet(psB.topics.get(topic), [])
        expect(changedPeerId.toString()).to.equal(first(psB.peers).id.toString())
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

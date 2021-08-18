// @ts-nocheck interface tests
/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const { expect } = require('aegir/utils/chai')
const sinon = require('sinon')

const pDefer = require('p-defer')
const pWaitFor = require('p-wait-for')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')

const {
  first,
  expectSet
} = require('./utils')

const topic = 'foo'

function shouldNotHappen (_) {
  expect.fail()
}

module.exports = (common) => {
  describe('pubsub with two nodes', () => {
    let psA, psB

    // Create pubsub nodes and connect them
    before(async () => {
      [psA, psB] = await common.setup(2)

      expect(psA.peers.size).to.be.eql(0)
      expect(psB.peers.size).to.be.eql(0)

      // Start pubsub and connect nodes
      psA.start()
      psB.start()

      await psA._libp2p.dial(psB.peerId)

      // Wait for peers to be ready in pubsub
      await pWaitFor(() => psA.peers.size === 1 && psB.peers.size === 1)
    })

    after(async () => {
      sinon.restore()

      psA && psA.stop()
      psB && psB.stop()

      await common.teardown()
    })

    it('Subscribe to a topic in nodeA', () => {
      const defer = pDefer()

      psB.once('pubsub:subscription-change', (changedPeerId, changedSubs) => {
        expectSet(psA.subscriptions, [topic])
        expect(psB.peers.size).to.equal(1)
        expectSet(psB.topics.get(topic), [psA.peerId.toB58String()])
        expect(changedPeerId.toB58String()).to.equal(first(psB.peers).id.toB58String())
        expect(changedSubs).to.have.lengthOf(1)
        expect(changedSubs[0].topicID).to.equal(topic)
        expect(changedSubs[0].subscribe).to.equal(true)
        defer.resolve()
      })
      psA.subscribe(topic)

      return defer.promise
    })

    it('Publish to a topic in nodeA', () => {
      const defer = pDefer()

      psA.once(topic, (msg) => {
        expect(uint8ArrayToString(msg.data)).to.equal('hey')
        psB.removeListener(topic, shouldNotHappen)
        defer.resolve()
      })

      psB.once(topic, shouldNotHappen)

      psA.publish(topic, uint8ArrayFromString('hey'))

      return defer.promise
    })

    it('Publish to a topic in nodeB', () => {
      const defer = pDefer()

      psA.once(topic, (msg) => {
        psA.once(topic, shouldNotHappen)
        expect(uint8ArrayToString(msg.data)).to.equal('banana')

        setTimeout(() => {
          psA.removeListener(topic, shouldNotHappen)
          psB.removeListener(topic, shouldNotHappen)

          defer.resolve()
        }, 100)
      })

      psB.once(topic, shouldNotHappen)

      psB.publish(topic, uint8ArrayFromString('banana'))

      return defer.promise
    })

    it('Publish 10 msg to a topic in nodeB', () => {
      const defer = pDefer()
      let counter = 0

      psB.once(topic, shouldNotHappen)
      psA.on(topic, receivedMsg)

      function receivedMsg (msg) {
        expect(uint8ArrayToString(msg.data)).to.equal('banana')
        expect(msg.from).to.be.eql(psB.peerId.toB58String())
        expect(msg.seqno).to.be.a('Uint8Array')
        expect(msg.topicIDs).to.be.eql([topic])

        if (++counter === 10) {
          psA.removeListener(topic, receivedMsg)
          psB.removeListener(topic, shouldNotHappen)

          defer.resolve()
        }
      }

      Array.from({ length: 10 }, (_, i) => psB.publish(topic, uint8ArrayFromString('banana')))

      return defer.promise
    })

    it('Unsubscribe from topic in nodeA', () => {
      const defer = pDefer()

      psA.unsubscribe(topic)
      expect(psA.subscriptions.size).to.equal(0)

      psB.once('pubsub:subscription-change', (changedPeerId, changedSubs) => {
        expect(psB.peers.size).to.equal(1)
        expectSet(psB.topics.get(topic), [])
        expect(changedPeerId.toB58String()).to.equal(first(psB.peers).id.toB58String())
        expect(changedSubs).to.have.lengthOf(1)
        expect(changedSubs[0].topicID).to.equal(topic)
        expect(changedSubs[0].subscribe).to.equal(false)

        defer.resolve()
      })

      return defer.promise
    })

    it('Publish to a topic:Z in nodeA nodeB', () => {
      const defer = pDefer()

      psA.once('Z', shouldNotHappen)
      psB.once('Z', shouldNotHappen)

      setTimeout(() => {
        psA.removeListener('Z', shouldNotHappen)
        psB.removeListener('Z', shouldNotHappen)
        defer.resolve()
      }, 100)

      psB.publish('Z', uint8ArrayFromString('banana'))
      psA.publish('Z', uint8ArrayFromString('banana'))

      return defer.promise
    })
  })
}

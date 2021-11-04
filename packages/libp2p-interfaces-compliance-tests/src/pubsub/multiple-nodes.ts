/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import delay from 'delay'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expectSet } from './utils.js'
import type { TestSetup } from '../index.js'
import type { PubSub, Message } from 'libp2p-interfaces/pubsub'

export default (common: TestSetup<PubSub>) => {
  describe('pubsub with multiple nodes', function () {
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA: PubSub, psB: PubSub, psC: PubSub

        // Create and start pubsub nodes
        beforeEach(async () => {
          psA = await common.setup()
          psB = await common.setup()
          psC = await common.setup()

          // Start pubsub modes
          ;[psA, psB, psC].map((p) => p.start())
        })

        // Connect nodes
        beforeEach(async () => {
          // @ts-expect-error protected field
          await psA._libp2p.dial(psB.peerId)
          // @ts-expect-error protected field
          await psB._libp2p.dial(psC.peerId)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.peers.size === 1 &&
            psC.peers.size === 1 &&
            psA.peers.size === 1
          )
        })

        afterEach(async () => {
          sinon.restore()

          ;[psA, psB, psC].map((p) => p.stop())
          await common.teardown()
        })

        it('subscribe to the topic on node a', async () => {
          const topic = 'Z'

          psA.subscribe(topic)
          expectSet(psA.subscriptions, [topic])

          await new Promise((resolve) => psB.once('pubsub:subscription-change', resolve))
          expect(psB.peers.size).to.equal(2)

          const aPeerId = psA.peerId.toB58String()
          expectSet(psB.topics.get(topic), [aPeerId])

          expect(psC.peers.size).to.equal(1)
          expect(psC.topics.get(topic)).to.eql(undefined)
        })

        it('subscribe to the topic on node b', async () => {
          const topic = 'Z'
          psB.subscribe(topic)
          expectSet(psB.subscriptions, [topic])

          await Promise.all([
            new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psC.once('pubsub:subscription-change', resolve))
          ])

          expect(psA.peers.size).to.equal(1)
          expectSet(psA.topics.get(topic), [psB.peerId.toB58String()])

          expect(psC.peers.size).to.equal(1)
          expectSet(psC.topics.get(topic), [psB.peerId.toB58String()])
        })

        it('subscribe to the topic on node c', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psC.subscribe(topic)
          expectSet(psC.subscriptions, [topic])

          psB.once('pubsub:subscription-change', () => {
            expect(psA.peers.size).to.equal(1)
            expect(psB.peers.size).to.equal(2)
            expectSet(psB.topics.get(topic), [psC.peerId.toB58String()])

            defer.resolve()
          })

          return await defer.promise
        })

        it('publish on node a', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psA.subscribe(topic)
          psB.subscribe(topic)
          psC.subscribe(topic)

          // await subscription change
          await Promise.all([
            new Promise(resolve => psA.once('pubsub:subscription-change', () => resolve(null))),
            new Promise(resolve => psB.once('pubsub:subscription-change', () => resolve(null))),
            new Promise(resolve => psC.once('pubsub:subscription-change', () => resolve(null)))
          ])

          // await a cycle
          await delay(1000)

          let counter = 0

          psA.on(topic, incMsg)
          psB.on(topic, incMsg)
          psC.on(topic, incMsg)

          void psA.publish(topic, uint8ArrayFromString('hey'))

          function incMsg (msg: Message) {
            expect(uint8ArrayToString(msg.data)).to.equal('hey')
            check()
          }

          function check () {
            if (++counter === 3) {
              psA.removeListener(topic, incMsg)
              psB.removeListener(topic, incMsg)
              psC.removeListener(topic, incMsg)
              defer.resolve()
            }
          }

          return await defer.promise
        })

        // since the topology is the same, just the publish
        // gets sent by other peer, we reused the same peers
        describe('1 level tree', () => {
          // 1 level tree
          //     ┌◉┐
          //     │b│
          //   ◉─┘ └─◉
          //   a     c

          it('publish on node b', async () => {
            const topic = 'Z'
            const defer = pDefer()
            let counter = 0

            psA.subscribe(topic)
            psB.subscribe(topic)
            psC.subscribe(topic)

            // await subscription change
            await Promise.all([
              new Promise(resolve => psA.once('pubsub:subscription-change', () => resolve(null))),
              new Promise(resolve => psB.once('pubsub:subscription-change', () => resolve(null))),
              new Promise(resolve => psC.once('pubsub:subscription-change', () => resolve(null)))
            ])

            psA.on(topic, incMsg)
            psB.on(topic, incMsg)
            psC.on(topic, incMsg)

            // await a cycle
            await delay(1000)

            void psB.publish(topic, uint8ArrayFromString('hey'))

            function incMsg (msg: Message) {
              expect(uint8ArrayToString(msg.data)).to.equal('hey')
              check()
            }

            function check () {
              if (++counter === 3) {
                psA.removeListener(topic, incMsg)
                psB.removeListener(topic, incMsg)
                psC.removeListener(topic, incMsg)
                defer.resolve()
              }
            }

            return await defer.promise
          })
        })
      })

      describe('2 level tree', () => {
        // 2 levels tree
        //      ┌◉┐
        //      │c│
        //   ┌◉─┘ └─◉┐
        //   │b     d│
        // ◉─┘       └─◉
        // a
        let psA: PubSub, psB: PubSub, psC: PubSub, psD: PubSub, psE: PubSub

        // Create and start pubsub nodes
        beforeEach(async () => {
          psA = await common.setup()
          psB = await common.setup()
          psC = await common.setup()
          psD = await common.setup()
          psE = await common.setup()

          // Start pubsub nodes
          ;[psA, psB, psC, psD, psE].map((p) => p.start())
        })

        // connect nodes
        beforeEach(async () => {
          // @ts-expect-error protected field
          await psA._libp2p.dial(psB.peerId)
          // @ts-expect-error protected field
          await psB._libp2p.dial(psC.peerId)
          // @ts-expect-error protected field
          await psC._libp2p.dial(psD.peerId)
          // @ts-expect-error protected field
          await psD._libp2p.dial(psE.peerId)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.peers.size === 1 &&
            psB.peers.size === 2 &&
            psC.peers.size === 2 &&
            psD.peers.size === 2 &&
            psE.peers.size === 1
          )
        })

        afterEach(async () => {
          [psA, psB, psC, psD, psE].map((p) => p.stop())
          await common.teardown()
        })

        it('subscribes', () => {
          psA.subscribe('Z')
          expectSet(psA.subscriptions, ['Z'])
          psB.subscribe('Z')
          expectSet(psB.subscriptions, ['Z'])
          psC.subscribe('Z')
          expectSet(psC.subscriptions, ['Z'])
          psD.subscribe('Z')
          expectSet(psD.subscriptions, ['Z'])
          psE.subscribe('Z')
          expectSet(psE.subscriptions, ['Z'])
        })

        it('publishes from c', async function () {
          const defer = pDefer()
          let counter = 0

          psA.subscribe('Z')
          psA.on('Z', incMsg)
          psB.subscribe('Z')
          psB.on('Z', incMsg)
          psC.subscribe('Z')
          psC.on('Z', incMsg)
          psD.subscribe('Z')
          psD.on('Z', incMsg)
          psE.subscribe('Z')
          psE.on('Z', incMsg)

          await Promise.all([
            new Promise((resolve) => psA.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psB.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psC.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psD.once('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psE.once('pubsub:subscription-change', resolve))
          ])

          // await a cycle
          await delay(1000)

          void psC.publish('Z', uint8ArrayFromString('hey from c'))

          function incMsg (msg: Message) {
            expect(uint8ArrayToString(msg.data)).to.equal('hey from c')
            check()
          }

          function check () {
            if (++counter === 5) {
              psA.unsubscribe('Z')
              psB.unsubscribe('Z')
              psC.unsubscribe('Z')
              psD.unsubscribe('Z')
              psE.unsubscribe('Z')
              defer.resolve()
            }
          }

          return await defer.promise
        })
      })
    })

    describe('only some nodes subscribe the networks', () => {
      describe('line', () => {
        // line
        // ◉────◎────◉
        // a    b    c

        before(() => { })
        after(() => { })
      })

      describe('1 level tree', () => {
        // 1 level tree
        //     ┌◉┐
        //     │b│
        //   ◎─┘ └─◉
        //   a     c

        before(() => { })
        after(() => { })
      })

      describe('2 level tree', () => {
        // 2 levels tree
        //      ┌◉┐
        //      │c│
        //   ┌◎─┘ └─◉┐
        //   │b     d│
        // ◉─┘       └─◎
        // a           e

        before(() => { })
        after(() => { })
      })
    })
  })
}

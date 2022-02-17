/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import delay from 'delay'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { TestSetup } from '../index.js'
import type { PubSub, Message, PubSubOptions } from '@libp2p/interfaces/pubsub'
import type { EventMap } from './index.js'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import type { Registrar } from '@libp2p/interfaces/src/registrar'
import { connectPeers, mockRegistrar } from '../mocks/registrar.js'

export default (common: TestSetup<PubSub<EventMap>, PubSubOptions>) => {
  describe('pubsub with multiple nodes', function () {
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA: PubSub<EventMap>
        let psB: PubSub<EventMap>
        let psC: PubSub<EventMap>
        let peerIdA: PeerId
        let peerIdB: PeerId
        let peerIdC: PeerId
        let registrarA: Registrar
        let registrarB: Registrar
        let registrarC: Registrar

        // Create and start pubsub nodes
        beforeEach(async () => {
          peerIdA = await createEd25519PeerId()
          peerIdB = await createEd25519PeerId()
          peerIdC = await createEd25519PeerId()

          registrarA = mockRegistrar()
          registrarB = mockRegistrar()
          registrarC = mockRegistrar()

          psA = await common.setup({
            peerId: peerIdA,
            registrar: registrarA
          })
          psB = await common.setup({
            peerId: peerIdB,
            registrar: registrarB
          })
          psC = await common.setup({
            peerId: peerIdC,
            registrar: registrarC
          })

          // Start pubsub modes
          await Promise.all(
            [psA, psB, psC].map((p) => p.start())
          )
        })

        // Connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], registrarA, registrarB, peerIdA, peerIdB)
          await connectPeers(psB.multicodecs[0], registrarB, registrarC, peerIdB, peerIdC)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.getPeers().length === 1 &&
            psC.getPeers().length === 1 &&
            psA.getPeers().length === 1
          )
        })

        afterEach(async () => {
          sinon.restore()

          await Promise.all(
            [psA, psB, psC].map((p) => p.stop())
          )

          await common.teardown()
        })

        it('subscribe to the topic on node a', async () => {
          const topic = 'Z'

          psA.subscribe(topic)
          expect(psA.getTopics()).to.deep.equal([topic])

          await new Promise((resolve) => psB.addEventListener('pubsub:subscription-change', resolve, {
            once: true
          }))
          expect(psB.getPeers().length).to.equal(2)

          expect(psB.getSubscribers(topic)).to.deep.equal([peerIdA])

          expect(psC.getPeers().length).to.equal(1)
          expect(psC.getSubscribers(topic)).to.be.empty()
        })

        it('subscribe to the topic on node b', async () => {
          const topic = 'Z'
          psB.subscribe(topic)
          expect(psB.getTopics()).to.deep.equal([topic])

          await Promise.all([
            new Promise((resolve) => psA.addEventListener('pubsub:subscription-change', resolve, {
              once: true
            })),
            new Promise((resolve) => psC.addEventListener('pubsub:subscription-change', resolve, {
              once: true
            }))
          ])

          expect(psA.getPeers().length).to.equal(1)
          expect(psA.getSubscribers(topic)).to.deep.equal([peerIdB])

          expect(psC.getPeers().length).to.equal(1)
          expect(psC.getSubscribers(topic)).to.deep.equal([peerIdB])
        })

        it('subscribe to the topic on node c', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psC.subscribe(topic)
          expect(psC.getTopics()).to.deep.equal([topic])

          psB.addEventListener('pubsub:subscription-change', () => {
            expect(psA.getPeers().length).to.equal(1)
            expect(psB.getPeers().length).to.equal(2)
            expect(psB.getSubscribers(topic)).to.deep.equal([peerIdC])

            defer.resolve()
          }, {
            once: true
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
            new Promise(resolve => psA.addEventListener('pubsub:subscription-change', () => resolve(null), {
              once: true
            })),
            new Promise(resolve => psB.addEventListener('pubsub:subscription-change', () => resolve(null), {
              once: true
            })),
            new Promise(resolve => psC.addEventListener('pubsub:subscription-change', () => resolve(null), {
              once: true
            }))
          ])

          // await a cycle
          await delay(1000)

          let counter = 0

          psA.addEventListener(topic, incMsg)
          psB.addEventListener(topic, incMsg)
          psC.addEventListener(topic, incMsg)

          void psA.publish(topic, uint8ArrayFromString('hey'))

          function incMsg (evt: CustomEvent<Message>) {
            const msg = evt.detail
            expect(uint8ArrayToString(msg.data)).to.equal('hey')
            check()
          }

          function check () {
            if (++counter === 3) {
              psA.removeEventListener(topic, incMsg)
              psB.removeEventListener(topic, incMsg)
              psC.removeEventListener(topic, incMsg)
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
              new Promise(resolve => psA.addEventListener('pubsub:subscription-change', () => resolve(null), {
                once: true
              })),
              new Promise(resolve => psB.addEventListener('pubsub:subscription-change', () => resolve(null), {
                once: true
              })),
              new Promise(resolve => psC.addEventListener('pubsub:subscription-change', () => resolve(null), {
                once: true
              }))
            ])

            psA.addEventListener(topic, incMsg)
            psB.addEventListener(topic, incMsg)
            psC.addEventListener(topic, incMsg)

            // await a cycle
            await delay(1000)

            void psB.publish(topic, uint8ArrayFromString('hey'))

            function incMsg (evt: CustomEvent<Message>) {
              const msg = evt.detail
              expect(uint8ArrayToString(msg.data)).to.equal('hey')
              check()
            }

            function check () {
              if (++counter === 3) {
                psA.removeEventListener(topic, incMsg)
                psB.removeEventListener(topic, incMsg)
                psC.removeEventListener(topic, incMsg)
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
        let psA: PubSub<EventMap>
        let psB: PubSub<EventMap>
        let psC: PubSub<EventMap>
        let psD: PubSub<EventMap>
        let psE: PubSub<EventMap>
        let peerIdA: PeerId
        let peerIdB: PeerId
        let peerIdC: PeerId
        let peerIdD: PeerId
        let peerIdE: PeerId
        let registrarA: Registrar
        let registrarB: Registrar
        let registrarC: Registrar
        let registrarD: Registrar
        let registrarE: Registrar

        // Create and start pubsub nodes
        beforeEach(async () => {
          peerIdA = await createEd25519PeerId()
          peerIdB = await createEd25519PeerId()
          peerIdC = await createEd25519PeerId()
          peerIdD = await createEd25519PeerId()
          peerIdE = await createEd25519PeerId()

          registrarA = mockRegistrar()
          registrarB = mockRegistrar()
          registrarC = mockRegistrar()
          registrarD = mockRegistrar()
          registrarE = mockRegistrar()

          psA = await common.setup({
            peerId: peerIdA,
            registrar: registrarA
          })
          psB = await common.setup({
            peerId: peerIdB,
            registrar: registrarB
          })
          psC = await common.setup({
            peerId: peerIdC,
            registrar: registrarC
          })
          psD = await common.setup({
            peerId: peerIdD,
            registrar: registrarD
          })
          psE = await common.setup({
            peerId: peerIdE,
            registrar: registrarE
          })

          // Start pubsub nodes
          await Promise.all(
            [psA, psB, psC, psD, psE].map((p) => p.start())
          )
        })

        // connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], registrarA, registrarB, peerIdA, peerIdB)
          await connectPeers(psA.multicodecs[0], registrarB, registrarC, peerIdB, peerIdC)
          await connectPeers(psA.multicodecs[0], registrarC, registrarD, peerIdC, peerIdD)
          await connectPeers(psA.multicodecs[0], registrarD, registrarE, peerIdD, peerIdE)

          // Wait for peers to be ready in pubsub
          await pWaitFor(() =>
            psA.getPeers().length === 1 &&
            psB.getPeers().length === 2 &&
            psC.getPeers().length === 2 &&
            psD.getPeers().length === 2 &&
            psE.getPeers().length === 1
          )
        })

        afterEach(async () => {
          await Promise.all(
            [psA, psB, psC, psD, psE].map((p) => p.stop())
          )
          await common.teardown()
        })

        it('subscribes', () => {
          psA.subscribe('Z')
          expect(psA.getTopics()).to.deep.equal(['Z'])
          psB.subscribe('Z')
          expect(psB.getTopics()).to.deep.equal(['Z'])
          psC.subscribe('Z')
          expect(psC.getTopics()).to.deep.equal(['Z'])
          psD.subscribe('Z')
          expect(psD.getTopics()).to.deep.equal(['Z'])
          psE.subscribe('Z')
          expect(psE.getTopics()).to.deep.equal(['Z'])
        })

        it('publishes from c', async function () {
          const defer = pDefer()
          let counter = 0

          psA.subscribe('Z')
          psA.addEventListener('Z', incMsg)
          psB.subscribe('Z')
          psB.addEventListener('Z', incMsg)
          psC.subscribe('Z')
          psC.addEventListener('Z', incMsg)
          psD.subscribe('Z')
          psD.addEventListener('Z', incMsg)
          psE.subscribe('Z')
          psE.addEventListener('Z', incMsg)

          await Promise.all([
            new Promise((resolve) => psA.addEventListener('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psB.addEventListener('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psC.addEventListener('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psD.addEventListener('pubsub:subscription-change', resolve)),
            new Promise((resolve) => psE.addEventListener('pubsub:subscription-change', resolve))
          ])

          // await a cycle
          await delay(1000)

          void psC.publish('Z', uint8ArrayFromString('hey from c'))

          function incMsg (evt: CustomEvent<Message>) {
            const msg = evt.detail
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

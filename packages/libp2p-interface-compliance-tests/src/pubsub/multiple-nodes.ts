/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import delay from 'delay'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { connectPeers, mockRegistrar } from '../mocks/registrar.js'
import { CustomEvent } from '@libp2p/interfaces'
import type { TestSetup } from '../index.js'
import type { Message, PubSubOptions } from '@libp2p/interfaces/pubsub'
import type { EventMap } from './index.js'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'
import type { Registrar } from '@libp2p/interfaces/src/registrar'
import type { PubsubBaseProtocol } from '@libp2p/pubsub'

export default (common: TestSetup<PubsubBaseProtocol<EventMap>, PubSubOptions>) => {
  describe('pubsub with multiple nodes', function () {
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA: PubsubBaseProtocol<EventMap>
        let psB: PubsubBaseProtocol<EventMap>
        let psC: PubsubBaseProtocol<EventMap>
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
            registrar: registrarA,
            emitSelf: true
          })
          psB = await common.setup({
            peerId: peerIdB,
            registrar: registrarB,
            emitSelf: true
          })
          psC = await common.setup({
            peerId: peerIdC,
            registrar: registrarC,
            emitSelf: true
          })

          // Start pubsub modes
          await Promise.all(
            [psA, psB, psC].map(async (p) => await p.start())
          )
        })

        // Connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdA,
            registrar: registrarA
          }, {
            peerId: peerIdB,
            registrar: registrarB
          })
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdB,
            registrar: registrarB
          }, {
            peerId: peerIdC,
            registrar: registrarC
          })

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
            [psA, psB, psC].map(async (p) => await p.stop())
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

          expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([peerIdA.toString()])

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
          expect(psA.getSubscribers(topic).map(p => p.toString())).to.deep.equal([peerIdB.toString()])

          expect(psC.getPeers().length).to.equal(1)
          expect(psC.getSubscribers(topic).map(p => p.toString())).to.deep.equal([peerIdB.toString()])
        })

        it('subscribe to the topic on node c', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psC.subscribe(topic)
          expect(psC.getTopics()).to.deep.equal([topic])

          psB.addEventListener('pubsub:subscription-change', () => {
            expect(psA.getPeers().length).to.equal(1)
            expect(psB.getPeers().length).to.equal(2)
            expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([peerIdC.toString()])

            defer.resolve()
          }, {
            once: true
          })

          return await defer.promise
        })

        it('publish on node a', async () => {
          const topic = 'Z'
          const defer = pDefer()

          // await subscription change
          const p = Promise.all([
            new Promise<void>(resolve => psA.addEventListener('pubsub:subscription-change', () => resolve(), {
              once: true
            })),
            new Promise<void>(resolve => psB.addEventListener('pubsub:subscription-change', () => resolve(), {
              once: true
            })),
            new Promise<void>(resolve => psC.addEventListener('pubsub:subscription-change', () => resolve(), {
              once: true
            }))
          ])

          psA.subscribe(topic)
          psB.subscribe(topic)
          psC.subscribe(topic)

          await p

          let counter = 0

          psA.addEventListener(topic, incMsg)
          psB.addEventListener(topic, incMsg)
          psC.addEventListener(topic, incMsg)

          // await a cycle
          await delay(1000)

          void psA.dispatchEvent(new CustomEvent(topic, { detail: uint8ArrayFromString('hey') }))

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

            void psB.dispatchEvent(new CustomEvent(topic, { detail: uint8ArrayFromString('hey') }))

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
        let psA: PubsubBaseProtocol<EventMap>
        let psB: PubsubBaseProtocol<EventMap>
        let psC: PubsubBaseProtocol<EventMap>
        let psD: PubsubBaseProtocol<EventMap>
        let psE: PubsubBaseProtocol<EventMap>
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
            registrar: registrarA,
            emitSelf: true
          })
          psB = await common.setup({
            peerId: peerIdB,
            registrar: registrarB,
            emitSelf: true
          })
          psC = await common.setup({
            peerId: peerIdC,
            registrar: registrarC,
            emitSelf: true
          })
          psD = await common.setup({
            peerId: peerIdD,
            registrar: registrarD,
            emitSelf: true
          })
          psE = await common.setup({
            peerId: peerIdE,
            registrar: registrarE,
            emitSelf: true
          })

          // Start pubsub nodes
          await Promise.all(
            [psA, psB, psC, psD, psE].map(async (p) => await p.start())
          )
        })

        // connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdA,
            registrar: registrarA
          }, {
            peerId: peerIdB,
            registrar: registrarB
          })
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdB,
            registrar: registrarB
          }, {
            peerId: peerIdC,
            registrar: registrarC
          })
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdC,
            registrar: registrarC
          }, {
            peerId: peerIdD,
            registrar: registrarD
          })
          await connectPeers(psA.multicodecs[0], {
            peerId: peerIdD,
            registrar: registrarD
          }, {
            peerId: peerIdE,
            registrar: registrarE
          })

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
            [psA, psB, psC, psD, psE].map(async (p) => await p.stop())
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

          void psC.dispatchEvent(new CustomEvent('Z', { detail: uint8ArrayFromString('hey from c') }))

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

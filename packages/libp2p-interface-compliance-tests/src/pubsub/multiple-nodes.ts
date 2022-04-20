/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { connectPeers, mockRegistrar } from '../mocks/registrar.js'
import { waitForSubscriptionUpdate } from './utils.js'
import type { TestSetup } from '../index.js'
import type { Message } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Registrar } from '@libp2p/interfaces/registrar'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import { Components } from '@libp2p/interfaces/components'
import { start, stop } from '../index.js'

export default (common: TestSetup<PubSubBaseProtocol, PubSubArgs>) => {
  describe('pubsub with multiple nodes', function () {
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA: PubSubBaseProtocol
        let psB: PubSubBaseProtocol
        let psC: PubSubBaseProtocol
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
              emitSelf: true
            }
          })
          psC = await common.setup({
            components: new Components({
              peerId: peerIdC,
              registrar: registrarC
            }),
            init: {
              emitSelf: true
            }
          })

          // Start pubsub modes
          await start(psA, psB, psC)
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

          await stop(psA, psB, psC)

          await common.teardown()
        })

        it('subscribe to the topic on node a', async () => {
          const topic = 'Z'

          psA.subscribe(topic)
          expect(psA.getTopics()).to.deep.equal([topic])

          await waitForSubscriptionUpdate(psB, psA)

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
            waitForSubscriptionUpdate(psA, psB),
            waitForSubscriptionUpdate(psC, psB)
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

          psA.subscribe(topic)
          psB.subscribe(topic)
          psC.subscribe(topic)

          let counter = 0

          psA.addEventListener(topic, incMsg)
          psB.addEventListener(topic, incMsg)
          psC.addEventListener(topic, incMsg)

          await Promise.all([
            waitForSubscriptionUpdate(psA, psB),
            waitForSubscriptionUpdate(psB, psA),
            waitForSubscriptionUpdate(psC, psB)
          ])

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

            await Promise.all([
              waitForSubscriptionUpdate(psA, psB),
              waitForSubscriptionUpdate(psB, psA),
              waitForSubscriptionUpdate(psC, psB)
            ])

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
        let psA: PubSubBaseProtocol
        let psB: PubSubBaseProtocol
        let psC: PubSubBaseProtocol
        let psD: PubSubBaseProtocol
        let psE: PubSubBaseProtocol
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
              emitSelf: true
            }
          })
          psC = await common.setup({
            components: new Components({
              peerId: peerIdC,
              registrar: registrarC
            }),
            init: {
              emitSelf: true
            }
          })
          psD = await common.setup({
            components: new Components({
              peerId: peerIdD,
              registrar: registrarD
            }),
            init: {
              emitSelf: true
            }
          })
          psE = await common.setup({
            components: new Components({
              peerId: peerIdE,
              registrar: registrarE
            }),
            init: {
              emitSelf: true
            }
          })

          // Start pubsub nodes
          await start(psA, psB, psC, psD, psE)
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
          await stop(psA, psB, psC, psD, psE)
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
            waitForSubscriptionUpdate(psA, psB),
            waitForSubscriptionUpdate(psB, psA),
            waitForSubscriptionUpdate(psC, psB),
            waitForSubscriptionUpdate(psD, psC),
            waitForSubscriptionUpdate(psE, psD)
          ])

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

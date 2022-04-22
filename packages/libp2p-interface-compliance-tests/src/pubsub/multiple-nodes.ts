/* eslint max-nested-callbacks: ["error", 6] */
import { expect } from 'aegir/chai'
import sinon from 'sinon'
import pDefer from 'p-defer'
import pWaitFor from 'p-wait-for'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { connectPeers } from '../mocks/registrar.js'
import { createComponents, waitForSubscriptionUpdate } from './utils.js'
import type { TestSetup } from '../index.js'
import type { Message, PubSub } from '@libp2p/interfaces/pubsub'
import type { PubSubArgs } from './index.js'
import type { Components } from '@libp2p/interfaces/components'
import { start, stop } from '../index.js'

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('pubsub with multiple nodes', function () {
    describe('every peer subscribes to the topic', () => {
      describe('line', () => {
        // line
        // ◉────◉────◉
        // a    b    c
        let psA: PubSub
        let psB: PubSub
        let psC: PubSub
        let componentsA: Components
        let componentsB: Components
        let componentsC: Components

        // Create and start pubsub nodes
        beforeEach(async () => {
          componentsA = await createComponents()
          componentsB = await createComponents()
          componentsC = await createComponents()

          psA = await common.setup({
            components: componentsA,
            init: {
              emitSelf: true
            }
          })
          psB = await common.setup({
            components: componentsB,
            init: {
              emitSelf: true
            }
          })
          psC = await common.setup({
            components: componentsC,
            init: {
              emitSelf: true
            }
          })

          // Start pubsub modes
          await start(psA, psB, psC)
        })

        // Connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], componentsA, componentsB)
          await connectPeers(psB.multicodecs[0], componentsB, componentsC)

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

          await waitForSubscriptionUpdate(psB, componentsA.getPeerId())

          expect(psB.getPeers().length).to.equal(2)
          expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([componentsA.getPeerId().toString()])

          expect(psC.getPeers().length).to.equal(1)
          expect(psC.getSubscribers(topic)).to.be.empty()
        })

        it('subscribe to the topic on node b', async () => {
          const topic = 'Z'
          psB.subscribe(topic)
          expect(psB.getTopics()).to.deep.equal([topic])

          await Promise.all([
            waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
            waitForSubscriptionUpdate(psC, componentsB.getPeerId())
          ])

          expect(psA.getPeers().length).to.equal(1)
          expect(psA.getSubscribers(topic).map(p => p.toString())).to.deep.equal([componentsB.getPeerId().toString()])

          expect(psC.getPeers().length).to.equal(1)
          expect(psC.getSubscribers(topic).map(p => p.toString())).to.deep.equal([componentsB.getPeerId().toString()])
        })

        it('subscribe to the topic on node c', async () => {
          const topic = 'Z'
          const defer = pDefer()

          psC.subscribe(topic)
          expect(psC.getTopics()).to.deep.equal([topic])

          psB.addEventListener('subscription-change', () => {
            expect(psA.getPeers().length).to.equal(1)
            expect(psB.getPeers().length).to.equal(2)
            expect(psB.getSubscribers(topic).map(p => p.toString())).to.deep.equal([componentsC.getPeerId().toString()])

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

          psA.addEventListener('message', incMsg)
          psB.addEventListener('message', incMsg)
          psC.addEventListener('message', incMsg)

          await Promise.all([
            waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
            waitForSubscriptionUpdate(psB, componentsA.getPeerId()),
            waitForSubscriptionUpdate(psC, componentsB.getPeerId())
          ])

          const result = await psA.publish(topic, uint8ArrayFromString('hey'))

          expect(result).to.have.property('recipients').with.property('length').greaterThanOrEqual(1)

          function incMsg (evt: CustomEvent<Message>) {
            const msg = evt.detail

            if (msg.topic !== topic) {
              return
            }

            expect(uint8ArrayToString(msg.data)).to.equal('hey')
            check()
          }

          function check () {
            if (++counter === 3) {
              psA.removeEventListener('message', incMsg)
              psB.removeEventListener('message', incMsg)
              psC.removeEventListener('message', incMsg)
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

            psA.addEventListener('message', incMsg)
            psB.addEventListener('message', incMsg)
            psC.addEventListener('message', incMsg)

            psA.subscribe(topic)
            psB.subscribe(topic)
            psC.subscribe(topic)

            await Promise.all([
              waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
              waitForSubscriptionUpdate(psB, componentsA.getPeerId()),
              waitForSubscriptionUpdate(psC, componentsB.getPeerId())
            ])

            await psB.publish(topic, uint8ArrayFromString('hey'))

            function incMsg (evt: CustomEvent<Message>) {
              const msg = evt.detail

              if (msg.topic !== topic) {
                return
              }

              expect(uint8ArrayToString(msg.data)).to.equal('hey')
              check()
            }

            function check () {
              if (++counter === 3) {
                psA.removeEventListener('message', incMsg)
                psB.removeEventListener('message', incMsg)
                psC.removeEventListener('message', incMsg)
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
        let psA: PubSub
        let psB: PubSub
        let psC: PubSub
        let psD: PubSub
        let psE: PubSub
        let componentsA: Components
        let componentsB: Components
        let componentsC: Components
        let componentsD: Components
        let componentsE: Components

        // Create and start pubsub nodes
        beforeEach(async () => {
          componentsA = await createComponents()
          componentsB = await createComponents()
          componentsC = await createComponents()
          componentsD = await createComponents()
          componentsE = await createComponents()

          psA = await common.setup({
            components: componentsA,
            init: {
              emitSelf: true
            }
          })
          psB = await common.setup({
            components: componentsB,
            init: {
              emitSelf: true
            }
          })
          psC = await common.setup({
            components: componentsC,
            init: {
              emitSelf: true
            }
          })
          psD = await common.setup({
            components: componentsD,
            init: {
              emitSelf: true
            }
          })
          psE = await common.setup({
            components: componentsE,
            init: {
              emitSelf: true
            }
          })

          // Start pubsub nodes
          await start(psA, psB, psC, psD, psE)
        })

        // connect nodes
        beforeEach(async () => {
          await connectPeers(psA.multicodecs[0], componentsA, componentsB)
          await connectPeers(psA.multicodecs[0], componentsB, componentsC)
          await connectPeers(psA.multicodecs[0], componentsC, componentsD)
          await connectPeers(psA.multicodecs[0], componentsD, componentsE)

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
          const topic = 'Z'

          psA.subscribe(topic)
          psA.addEventListener('message', incMsg)
          psB.subscribe(topic)
          psB.addEventListener('message', incMsg)
          psC.subscribe(topic)
          psC.addEventListener('message', incMsg)
          psD.subscribe(topic)
          psD.addEventListener('message', incMsg)
          psE.subscribe(topic)
          psE.addEventListener('message', incMsg)

          await Promise.all([
            waitForSubscriptionUpdate(psA, componentsB.getPeerId()),
            waitForSubscriptionUpdate(psB, componentsA.getPeerId()),
            waitForSubscriptionUpdate(psC, componentsB.getPeerId()),
            waitForSubscriptionUpdate(psD, componentsC.getPeerId()),
            waitForSubscriptionUpdate(psE, componentsD.getPeerId())
          ])

          await psC.publish('Z', uint8ArrayFromString('hey from c'))

          function incMsg (evt: CustomEvent<Message>) {
            const msg = evt.detail

            if (msg.topic !== topic) {
              return
            }

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

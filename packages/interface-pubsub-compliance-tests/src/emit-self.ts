import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { mockNetwork } from '@libp2p/interface-mocks'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { PubSubArgs, PubSubComponents } from './index.js'
import { start, stop } from '@libp2p/interfaces/startable'
import type { PubSub } from '@libp2p/interface-pubsub'
import { createComponents } from './utils.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = () => expect.fail()

export default (common: TestSetup<PubSub, PubSubArgs>) => {
  describe('emit self', () => {
    describe('enabled', () => {
      let pubsub: PubSub
      let components: PubSubComponents

      before(async () => {
        mockNetwork.reset()
        components = await createComponents()

        pubsub = components.pubsub = await common.setup({
          components,
          init: {
            emitSelf: true
          }
        })

        await start(...Object.values(components))
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await stop(...Object.values(components))
        await common.teardown()
        mockNetwork.reset()
      })

      it('should emit to self on publish', async () => {
        const promise = new Promise<void>((resolve) => {
          pubsub.addEventListener('message', (evt) => {
            if (evt.detail.topic === topic) {
              resolve()
            }
          }, {
            once: true
          })
        })

        const result = await pubsub.publish(topic, data)

        await promise

        expect(result).to.have.property('recipients').with.lengthOf(1)
      })
    })

    describe('disabled', () => {
      let pubsub: PubSub
      let components: PubSubComponents

      before(async () => {
        mockNetwork.reset()
        components = await createComponents()
        pubsub = components.pubsub = await common.setup({
          components,
          init: {
            emitSelf: false
          }
        })

        await start(...Object.values(components))
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await stop(...Object.values(components))
        await common.teardown()
        mockNetwork.reset()
      })

      it('should not emit to self on publish', async () => {
        pubsub.addEventListener('message', shouldNotHappen, {
          once: true
        })

        await pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return await new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

import { expect } from 'aegir/chai'
import sinon from 'sinon'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { mockRegistrar } from '../mocks/registrar.js'
import type { TestSetup } from '../index.js'
import type { PubSubArgs } from './index.js'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'
import { Components } from '@libp2p/interfaces/components'
import { start, stop } from '../index.js'

const topic = 'foo'
const data = uint8ArrayFromString('bar')
const shouldNotHappen = () => expect.fail()

export default (common: TestSetup<PubSubBaseProtocol, PubSubArgs>) => {
  describe('emit self', () => {
    let pubsub: PubSubBaseProtocol

    describe('enabled', () => {
      before(async () => {
        pubsub = await common.setup({
          components: new Components({
            peerId: await createEd25519PeerId(),
            registrar: mockRegistrar()
          }),
          init: {
            emitSelf: true
          }
        })
      })

      before(async () => {
        await start(pubsub)
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await stop(pubsub)
        await common.teardown()
      })

      it('should emit to self on publish', async () => {
        const promise = new Promise((resolve) => pubsub.addEventListener(topic, resolve, {
          once: true
        }))

        pubsub.publish(topic, data)

        return await promise
      })
    })

    describe('disabled', () => {
      before(async () => {
        pubsub = await common.setup({
          components: new Components({
            peerId: await createEd25519PeerId(),
            registrar: mockRegistrar()
          }),
          init: {
            emitSelf: false
          }
        })
      })

      before(async () => {
        await start(pubsub)
        pubsub.subscribe(topic)
      })

      after(async () => {
        sinon.restore()
        await stop(pubsub)
        await common.teardown()
      })

      it('should not emit to self on publish', async () => {
        pubsub.addEventListener(topic, () => shouldNotHappen, {
          once: true
        })

        pubsub.publish(topic, data)

        // Wait 1 second to guarantee that self is not noticed
        return await new Promise((resolve) => setTimeout(resolve, 1000))
      })
    })
  })
}

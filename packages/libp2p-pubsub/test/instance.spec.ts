import { expect } from 'aegir/utils/chai.js'
import { PubsubBaseProtocol } from '../src/index.js'
import {
  createPeerId,
  MockRegistrar
} from './utils/index.js'
import type { PeerId } from '@libp2p/interfaces/peer-id'
import type { Message } from '@libp2p/interfaces/pubsub'

class PubsubProtocol extends PubsubBaseProtocol<{}> {
  async _publish (message: Message): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

describe('pubsub instance', () => {
  let peerId: PeerId

  before(async () => {
    peerId = await createPeerId()
  })

  it('should throw if no debugName is provided', () => {
    expect(() => {
      // @ts-expect-error incorrect constructor args
      new PubsubProtocol() // eslint-disable-line no-new
    }).to.throw()
  })

  it('should accept valid parameters', () => {
    expect(() => {
      new PubsubProtocol({ // eslint-disable-line no-new
        debugName: 'pubsub',
        multicodecs: ['/pubsub/1.0.0'],
        peerId: peerId,
        registrar: new MockRegistrar()
      })
    }).not.to.throw()
  })
})

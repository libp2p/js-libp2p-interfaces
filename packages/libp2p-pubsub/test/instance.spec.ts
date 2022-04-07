import { expect } from 'aegir/chai'
import { PubSubBaseProtocol } from '../src/index.js'
import type { PubSubRPC, PubSubRPCMessage } from '@libp2p/interfaces/pubsub'

class PubsubProtocol extends PubSubBaseProtocol {
  decodeRpc (bytes: Uint8Array): PubSubRPC {
    throw new Error('Method not implemented.')
  }

  encodeRpc (rpc: PubSubRPC): Uint8Array {
    throw new Error('Method not implemented.')
  }

  decodeMessage (bytes: Uint8Array): PubSubRPCMessage {
    throw new Error('Method not implemented.')
  }

  encodeMessage (rpc: PubSubRPCMessage): Uint8Array {
    throw new Error('Method not implemented.')
  }

  async publishMessage (): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

describe('pubsub instance', () => {
  it('should throw if no init is provided', () => {
    expect(() => {
      // @ts-expect-error incorrect constructor args
      new PubsubProtocol() // eslint-disable-line no-new
    }).to.throw()
  })

  it('should accept valid parameters', () => {
    expect(() => {
      new PubsubProtocol({ // eslint-disable-line no-new
        multicodecs: ['/pubsub/1.0.0']
      })
    }).not.to.throw()
  })
})

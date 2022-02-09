import { duplexPair } from 'it-pair/duplex'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { PubsubBaseProtocol } from '../../src/index.js'
import { RPC, IRPC } from '../../src/message/rpc.js'
import type { Ed25519PeerId } from '@libp2p/peer-id'

export const createPeerId = async (): Promise<Ed25519PeerId> => {
  const peerId = await PeerIdFactory.createEd25519PeerId()

  return peerId
}

export class PubsubImplementation<Events> extends PubsubBaseProtocol<Events> {
  async _publish () {
    // ...
  }

  _decodeRpc (bytes: Uint8Array) {
    return RPC.decode(bytes)
  }

  _encodeRpc (rpc: IRPC) {
    return RPC.encode(rpc).finish()
  }
}

export const mockRegistrar = {
  handle: () => {},
  register: () => {},
  unregister: () => {}
}

export const ConnectionPair = () => {
  const [d0, d1] = duplexPair<Uint8Array>()

  return [
    {
      stream: d0,
      newStream: async () => await Promise.resolve({ stream: d0 })
    },
    {
      stream: d1,
      newStream: async () => await Promise.resolve({ stream: d1 })
    }
  ]
}

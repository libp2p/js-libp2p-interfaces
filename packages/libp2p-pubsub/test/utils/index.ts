// @ts-expect-error no types
import DuplexPair from 'it-pair/duplex.js'
import * as PeerIdFactory from 'libp2p-peer-id-factory'
import { PubsubBaseProtocol } from '../../src/index.js'
import { RPC, IRPC } from '../../src/message/rpc.js'
import type { Registrar } from 'libp2p-interfaces/registrar'
import type { PeerId } from 'libp2p-interfaces/peer-id'

export const createPeerId = async () => {
  const peerId = await PeerIdFactory.createEd25519PeerId()

  return peerId
}

export class PubsubImplementation extends PubsubBaseProtocol {
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

export const createMockRegistrar = (registrarRecord: Map<string, Record<string, any>>) => {
  const registrar: Registrar = {
    handle: (multicodecs: string[], handler) => {
      const rec = registrarRecord.get(multicodecs[0]) ?? {}

      registrarRecord.set(multicodecs[0], {
        ...rec,
        handler
      })
    },
    register: (topology) => {
      const { multicodecs } = topology
      const rec = registrarRecord.get(multicodecs[0]) ?? {}

      registrarRecord.set(multicodecs[0], {
        ...rec,
        onConnect: topology._onConnect,
        onDisconnect: topology._onDisconnect
      })

      return multicodecs[0]
    },
    unregister: (id: string) => {
      registrarRecord.delete(id)
    },

    getConnection (peerId: PeerId) {
      throw new Error('Not implemented')
    },

    peerStore: {
      on: () => {
        throw new Error('Not implemented')
      },
      protoBook: {
        get: () => {
          throw new Error('Not implemented')
        }
      },
      peers: new Map(),
      get: (peerId) => {
        throw new Error('Not implemented')
      }
    },

    connectionManager: {
      on: () => {
        throw new Error('Not implemented')
      }
    }
  }

  return registrar
}

export const ConnectionPair = () => {
  const [d0, d1] = DuplexPair()

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

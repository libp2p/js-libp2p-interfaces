import { duplexPair } from 'it-pair/duplex'
import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { PubsubBaseProtocol } from '../../src/index.js'
import { RPC, IRPC } from '../../src/message/rpc.js'
import { CustomEvent } from '@libp2p/interfaces'
import type { IncomingStreamData, Registrar, StreamHandler } from '@libp2p/interfaces/registrar'
import type { Ed25519PeerId } from '@libp2p/peer-id'
import type { MulticodecTopology } from '@libp2p/topology/multicodec-topology'
import type { Connection } from '@libp2p/interfaces/src/connection'
import type { PeerId } from '@libp2p/interfaces/src/peer-id'

export const createPeerId = async (): Promise<Ed25519PeerId> => {
  const peerId = await PeerIdFactory.createEd25519PeerId()

  return peerId
}

interface EventMap {
  'foo': CustomEvent
}

export class PubsubImplementation extends PubsubBaseProtocol<EventMap> {
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

export class MockRegistrar implements Registrar {
  public readonly topologies: Map<string, MulticodecTopology> = new Map()
  public readonly streamHandlers: Map<string, StreamHandler> = new Map()

  async handle (multicodecs: string | string[], handler: StreamHandler) {
    if (!Array.isArray(multicodecs)) {
      multicodecs = [multicodecs]
    }

    this.streamHandlers.set(multicodecs[0], handler)
  }

  async unhandle (multicodec: string) {
    this.streamHandlers.delete(multicodec)
  }

  register (topology: MulticodecTopology) {
    const { multicodecs } = topology

    this.topologies.set(multicodecs[0], topology)

    return multicodecs[0]
  }

  unregister (id: string) {
    this.topologies.delete(id)
  }
}

export const ConnectionPair = (): [Connection, Connection] => {
  const [d0, d1] = duplexPair<Uint8Array>()

  return [
    {
      // @ts-expect-error incomplete implementation
      newStream: async (protocol: string[]) => await Promise.resolve({
        protocol: protocol[0],
        stream: d0
      })
    },
    {
      // @ts-expect-error incomplete implementation
      newStream: async (protocol: string[]) => await Promise.resolve({
        protocol: protocol[0],
        stream: d1
      })
    }
  ]
}

export async function mockIncomingStreamEvent (protocol: string, conn: Connection, remotePeer: PeerId): Promise<CustomEvent<IncomingStreamData>> {
  // @ts-expect-error incomplete implementation
  return new CustomEvent('incomingStream', {
    detail: {
      ...await conn.newStream([protocol]),
      connection: {
        remotePeer
      }
    }
  })
}

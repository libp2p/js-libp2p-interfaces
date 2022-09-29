import type { PeerId } from '@libp2p/interface-peer-id'
import type { Duplex } from 'it-stream-types'

/**
 * A libp2p connection encrypter module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface ConnectionEncrypter {
  protocol: string

  /**
   * Encrypt outgoing data to the remote party. If the remote PeerId is known,
   * pass it for extra verification, otherwise it will be determined during
   * the handshake.
   */
  secureOutbound: (localPeer: PeerId, connection: Duplex<Uint8Array>, remotePeer?: PeerId) => Promise<SecuredConnection>

  /**
   * Decrypt incoming data. If the remote PeerId is known,
   * pass it for extra verification, otherwise it will be determined during
   * the handshake
   */
  secureInbound: (localPeer: PeerId, connection: Duplex<Uint8Array>, remotePeer?: PeerId) => Promise<SecuredConnection>
}

export interface SecuredConnection {
  conn: Duplex<Uint8Array>
  remoteEarlyData: Uint8Array
  remotePeer: PeerId
}

import type { PeerId } from '../peer-id'
import type { MultiaddrConnection } from '../transport'

/**
 * A libp2p crypto module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface Crypto {
  protocol: string
  /**
   * Encrypt outgoing data to the remote party.
   */
  secureOutbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId) => Promise<SecureOutbound>
  /**
   * Decrypt incoming data.
   */
  secureInbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId) => Promise<SecureOutbound>
}

export interface SecureOutbound {
  conn: MultiaddrConnection
  remoteEarlyData: Uint8Array
  remotePeer: PeerId
}

import type { PeerId } from '@libp2p/interface-peer-id'
import type { Duplex } from 'it-stream-types'
import type { MultiaddrConnection } from '@libp2p/interface-connection'

/**
 * A libp2p connection encrypter module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface ConnectionEncrypter {
  protocol: string

  /**
   * Encrypt outgoing data to the remote party.
   */
  secureOutbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId) => Promise<SecuredConnection>

  /**
   * Decrypt incoming data.
   */
  secureInbound: (localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId) => Promise<SecuredConnection>
}

export interface SecuredConnection {
  conn: Duplex<Uint8Array>
  remoteEarlyData: Uint8Array
  remotePeer: PeerId
}

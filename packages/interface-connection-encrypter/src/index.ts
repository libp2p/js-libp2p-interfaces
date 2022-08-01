import type { PeerId } from '@libp2p/interface-peer-id'
import type { Duplex } from 'it-stream-types'
import type { Uint8ArrayList } from 'uint8arraylist'

/**
 * A libp2p connection encrypter module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface ConnectionEncrypter {
  protocol: string

  /**
   * Encrypt outgoing data to the remote party.
   */
  secureOutbound: (localPeer: PeerId, connection: Duplex<Uint8ArrayList>, remotePeer: PeerId) => Promise<SecuredConnection>
  /**
   * Decrypt incoming data.
   */
  secureInbound: (localPeer: PeerId, connection: Duplex<Uint8ArrayList>, remotePeer?: PeerId) => Promise<SecuredConnection>
}

export interface SecuredConnection {
  conn: Duplex<Uint8ArrayList>
  remoteEarlyData: Uint8Array
  remotePeer: PeerId
}
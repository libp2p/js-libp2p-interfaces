/**
 * A libp2p crypto module must be compliant to this interface
 * to ensure all exchanged data between two peers is encrypted.
 */
export interface CryptoInterface {
  /**
   * Encrypt outgoing data to the remote party.
   *
   * @param {PeerId} localPeer - PeerId of the receiving peer
   * @param {MultiaddrConnection} connection - streaming iterable duplex that will be encrypted
   * @param {PeerId} remotePeer - PeerId of the remote peer. Used to validate the integrity of the remote peer.
   * @returns {Promise<SecureOutbound>}
   */
  secureOutbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId): Promise<SecureOutbound>;

  /**
   * Decrypt incoming data.
   *
   * @param {PeerId} localPeer - PeerId of the receiving peer.
   * @param {MultiaddrConnection} connection - streaming iterable duplex that will be encryption.
   * @param {PeerId} remotePeer - optional PeerId of the initiating peer, if known. This may only exist during transport upgrades.
   * @returns {Promise<SecureOutbound>}
   */
  secureInbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId): Promise<SecureOutbound>;
}

export declare class Crypto implements CryptoInterface {
  protocol: string;
  secureOutbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer: PeerId): Promise<SecureOutbound>;
  secureInbound(localPeer: PeerId, connection: MultiaddrConnection, remotePeer?: PeerId): Promise<SecureOutbound>;
}

export type SecureOutbound = {
  conn: MultiaddrConnection;
  remoteEarlyData: Buffer;
  remotePeer: PeerId;
}

type PeerId = import('peer-id');
type MultiaddrConnection = import('../transport/types').MultiaddrConnection

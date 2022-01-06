import type { CID } from 'multiformats/cid'
import type { PublicKey, PrivateKey, KeyType } from '../keys/types'

export interface PeerIdJSON {
  readonly id: string;
  readonly pubKey?: string;
  readonly privKey?: string;
}

export interface CreateOptions {
  bits?: number;
  keyType?: KeyType;
}

export interface PeerId {
  readonly id: Uint8Array
  privKey: PrivateKey;
  pubKey: PublicKey;

  /**
   * Return the protobuf version of the public key, matching go ipfs formatting
   */
  marshalPubKey: () => Uint8Array;

  /**
   * Return the protobuf version of the private key, matching go ipfs formatting
   */
  marshalPrivKey (): Uint8Array;

  /**
   * Return the protobuf version of the peer-id
   */
  marshal (excludePriv?: boolean): Uint8Array;

  /**
   * String representation
   */
  toPrint (): string;

  /**
   * The jsonified version of the key, matching the formatting of go-ipfs for its config file
   */
  toJSON (): PeerIdJSON;

  /**
   * Encode to hex.
   */
  toHexString ():string;

  /**
   * Return raw id bytes
   */
  toBytes () : Uint8Array;

  /**
   * Encode to base58 string.
   */
  toB58String (): string;

  /**
   * Self-describing String representation
   * in default format from RFC 0001: https://github.com/libp2p/specs/pull/209
   */
  toString ():string;

  /**
   * Checks the equality of `this` peer against a given PeerId.
   */
  equals (id: Uint8Array|PeerId): boolean | never;

  /**
   * Checks the equality of `this` peer against a given value.
   */
  isEqual(other: any): boolean;

  /**
   * Check if this PeerId instance is valid (privKey -> pubKey -> Id)
   */
  isValid (): boolean;

  /**
   * Check if the PeerId has an inline public key.
   */
  hasInlinePublicKey (): boolean;
}

export interface PeerIdFactory {
  /**
   * Create a new PeerId.
   **/
  new (id: Uint8Array, privKey?: PrivateKey, pubKey?: PublicKey): PeerId;

  /**
   * Create a new PeerId.
   **/
  create (args: CreateOptions): Promise<PeerId>;

  /**
   * Create PeerId from raw bytes.
   */
  createFromBytes (buf: Uint8Array): PeerId;

  /**
   * Create PeerId from base58-encoded string.
   */
   createFromB58String (str: string): PeerId;

  /**
   * Create PeerId from hex string.
   */
  createFromHexString (str: string): PeerId;

  /**
   * Create PeerId from CID.
   */
  createFromCID (cid: CID | Uint8Array | string): PeerId

  /**
   * Create PeerId from public key.
   */
  createFromPubKey (key: Uint8Array | string): Promise<PeerId>;

  /**
   * Create PeerId from private key.
   */
  createFromPrivKey (key: Uint8Array | string): Promise<PeerId>;

  /**
   * Create PeerId from PeerId JSON formatted object.
   */
  createFromJSON (obj: PeerIdJSON): Promise<PeerId>;

  /**
   * Create PeerId from Protobuf bytes.
   */
  createFromProtobuf (buf: Uint8Array | string): Promise<PeerId>;

  /**
   * Parse PeerId from string, maybe base58btc encoded without multibase prefix
   */
  parse (str: string): PeerId

  /**
   * Checks if a value is an instance of PeerId.
   */
  isPeerId (peerId:unknown): boolean;
}

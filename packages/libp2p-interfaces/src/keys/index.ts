
export interface PublicKey {
  readonly bytes: Uint8Array
  verify: (data: Uint8Array, sig: Uint8Array) => Promise<boolean>
  marshal: () => Uint8Array
  equals: (key: PublicKey) => boolean
  hash: () => Promise<Uint8Array>
}

/**
 * Generic private key interface
 */
export interface PrivateKey {
  readonly public: PublicKey
  readonly bytes: Uint8Array
  sign: (data: Uint8Array) => Promise<Uint8Array>
  marshal: () => Uint8Array
  equals: (key: PrivateKey) => boolean
  hash: () => Promise<Uint8Array>
  /**
   * Gets the ID of the key.
   *
   * The key id is the base58 encoding of the SHA-256 multihash of its public key.
   * The public key is a protobuf encoding containing a type and the DER encoding
   * of the PKCS SubjectPublicKeyInfo.
   */
  id: () => Promise<string>
  /**
   * Exports the password protected key in the format specified.
   */
  export: (password: string, format?: 'pkcs-8' | string) => Promise<string>
}

export type KeyType = 'Ed25519' | 'RSA' | 'secp256k1'

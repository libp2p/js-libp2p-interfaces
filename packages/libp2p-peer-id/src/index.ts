import { CID } from 'multiformats/cid'
import { bases } from 'multiformats/basics'
import { base58btc } from 'multiformats/bases/base58'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import type { MultibaseDecoder, MultibaseEncoder } from 'multiformats/types/bases/interface'
import type { MultihashDigest } from 'multiformats/types/hashes/interface'
import { sha256 } from 'multiformats/hashes/sha2'

const baseDecoder = Object
  .values(bases)
  .map(codec => codec.decoder)
  // @ts-expect-error https://github.com/multiformats/js-multiformats/issues/141
  .reduce((acc, curr) => acc.or(curr), bases.identity.decoder)

// these values are from https://github.com/multiformats/multicodec/blob/master/table.csv
const LIBP2P_KEY_CODE = 0x72

const MARSHALLED_ED225519_PUBLIC_KEY_LENGTH = 36
const MARSHALLED_SECP258K1_PUBLIC_KEY_LENGTH = 37

interface PeerIdOptions {
  type: 'RSA' | 'Ed25519' | 'secp256k1'
  multihash: MultihashDigest
  privateKey?: Uint8Array
}

interface RSAPeerIdOptions {
  multihash: MultihashDigest
  privateKey?: Uint8Array
  publicKey?: Uint8Array
}

interface Ed25519PeerIdOptions {
  multihash: MultihashDigest
  privateKey?: Uint8Array
}

interface Secp256k1PeerIdOptions {
  multihash: MultihashDigest
  privateKey?: Uint8Array
}

export class PeerId {
  public type: 'RSA' | 'Ed25519' | 'secp256k1'
  public readonly multihash: MultihashDigest
  public readonly privateKey?: Uint8Array
  public readonly publicKey?: Uint8Array

  constructor (opts: PeerIdOptions) {
    this.type = opts.type
    this.multihash = opts.multihash
    this.privateKey = opts.privateKey
  }

  toString (codec?: MultibaseEncoder<any>) {
    if (codec == null) {
      codec = base58btc
    }

    return codec.encode(this.multihash.bytes).slice(1)
  }

  // return self-describing String representation
  // in default format from RFC 0001: https://github.com/libp2p/specs/pull/209
  toCID () {
    return CID.createV1(LIBP2P_KEY_CODE, this.multihash)
  }

  toBytes () {
    return this.multihash.bytes
  }

  /**
   * Checks the equality of `this` peer against a given PeerId.
   *
   * @param {Uint8Array|PeerId} id
   * @returns {boolean}
   */
  equals (id: any) {
    if (id instanceof Uint8Array) {
      return uint8ArrayEquals(this.multihash.bytes, id)
    } else if (id?.multihash?.bytes != null) {
      return uint8ArrayEquals(this.multihash.bytes, id.multihash.bytes)
    } else {
      throw new Error('not valid Id')
    }
  }

  static fromString (str: string, decoder?: MultibaseDecoder<any>) {
    decoder = decoder ?? baseDecoder

    if (str.charAt(0) === '1' || str.charAt(0) === 'Q') {
      // identity hash ed25519/secp256k1 key or sha2-256 hash of
      // rsa public key - base58btc encoded either way
      const multihash = Digest.decode(base58btc.decode(`z${str}`))

      if (str.startsWith('12D')) {
        return new Ed25519PeerId({ multihash })
      } else if (str.startsWith('16U')) {
        return new Secp256k1PeerId({ multihash })
      } else {
        return new RSAPeerId({ multihash })
      }
    }

    return PeerId.fromBytes(baseDecoder.decode(str))
  }

  static fromBytes (buf: Uint8Array) {
    try {
      const multihash = Digest.decode(buf)

      if (multihash.code === identity.code) {
        if (multihash.digest.length === MARSHALLED_ED225519_PUBLIC_KEY_LENGTH) {
          return new Ed25519PeerId({ multihash })
        } else if (multihash.digest.length === MARSHALLED_SECP258K1_PUBLIC_KEY_LENGTH) {
          return new Secp256k1PeerId({ multihash })
        }
      }

      if (multihash.code === sha256.code) {
        return new RSAPeerId({ multihash })
      }
    } catch {
      return PeerId.fromCID(CID.decode(buf))
    }

    throw new Error('Supplied PeerID CID is invalid')
  }

  static fromCID (cid: CID) {
    if (cid == null || cid.multihash == null || cid.version == null || (cid.version === 1 && cid.code !== LIBP2P_KEY_CODE)) {
      throw new Error('Supplied PeerID CID is invalid')
    }

    const multihash = cid.multihash

    if (multihash.code === sha256.code) {
      return new RSAPeerId({ multihash: cid.multihash })
    } else if (multihash.code === identity.code) {
      if (multihash.bytes.length === MARSHALLED_ED225519_PUBLIC_KEY_LENGTH) {
        return new Ed25519PeerId({ multihash: cid.multihash })
      } else if (multihash.bytes.length === MARSHALLED_SECP258K1_PUBLIC_KEY_LENGTH) {
        return new Secp256k1PeerId({ multihash: cid.multihash })
      }
    }

    throw new Error('Supplied PeerID CID is invalid')
  }

  /**
   * @param publicKey - A marshalled public key
   * @param privateKey - A marshalled private key
   */
  static async fromKeys (publicKey: Uint8Array, privateKey?: Uint8Array) {
    if (publicKey.length === MARSHALLED_ED225519_PUBLIC_KEY_LENGTH) {
      return new Ed25519PeerId({ multihash: Digest.create(identity.code, publicKey), privateKey })
    }

    if (publicKey.length === MARSHALLED_SECP258K1_PUBLIC_KEY_LENGTH) {
      return new Secp256k1PeerId({ multihash: Digest.create(identity.code, publicKey), privateKey })
    }

    return new RSAPeerId({ multihash: await sha256.digest(publicKey), publicKey, privateKey })
  }
}

export class RSAPeerId extends PeerId {
  public readonly type = 'RSA'
  public readonly publicKey?: Uint8Array

  constructor (opts: RSAPeerIdOptions) {
    super({ ...opts, type: 'RSA' })

    this.publicKey = opts.publicKey
  }
}

export class Ed25519PeerId extends PeerId {
  public readonly type = 'Ed25519'
  public readonly publicKey: Uint8Array

  constructor (opts: Ed25519PeerIdOptions) {
    super({ ...opts, type: 'Ed25519' })

    this.publicKey = opts.multihash.digest
  }
}

export class Secp256k1PeerId extends PeerId {
  public readonly type = 'secp256k1'
  public readonly publicKey: Uint8Array

  constructor (opts: Secp256k1PeerIdOptions) {
    super({ ...opts, type: 'secp256k1' })

    this.publicKey = opts.multihash.digest
  }
}

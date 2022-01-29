import type { CID } from 'multiformats/cid'
import type { MultihashDigest } from 'multiformats/hashes/interface'
import type { MultibaseEncoder } from 'multiformats/bases/interface'

export interface PeerId {
  readonly type: 'RSA' | 'Ed25519' | 'secp256k1'
  readonly multihash: MultihashDigest
  readonly privateKey?: Uint8Array
  readonly publicKey?: Uint8Array

  toString: (codec?: MultibaseEncoder<any>) => string
  toCID: () => CID
  toBytes: () => Uint8Array
  equals: (other: any) => boolean
}

export interface RSAPeerId extends PeerId {
  readonly type: 'RSA'
  readonly publicKey?: Uint8Array
}

export interface Ed25519PeerId extends PeerId {
  readonly type: 'Ed25519'
  readonly publicKey: Uint8Array
}

export interface Secp256k1PeerId extends PeerId {
  readonly type: 'secp256k1'
  readonly publicKey: Uint8Array
}

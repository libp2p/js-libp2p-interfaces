import { keys } from 'libp2p-crypto'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { PeerId } from 'libp2p-peer-id'
import { PeerIdProto } from './proto.js'
import type { PublicKey, PrivateKey } from 'libp2p-interfaces/keys'
import type { RSAPeerId, Ed25519PeerId, Secp256k1PeerId } from 'libp2p-peer-id'

export const createEd25519PeerId = async (): Promise<Ed25519PeerId> => {
  const key = await keys.generateKeyPair('Ed25519')
  const id = await createFromPrivKey(key)

  if (id.type === 'Ed25519') {
    return id
  }

  throw new Error(`Generated unexpected PeerId type "${id.type}"`)
}

export const createSecp256k1PeerId = async (): Promise<Secp256k1PeerId> => {
  const key = await keys.generateKeyPair('secp256k1')
  const id = await createFromPrivKey(key)

  if (id.type === 'secp256k1') {
    return id
  }

  throw new Error(`Generated unexpected PeerId type "${id.type}"`)
}

export const createRSAPeerId = async (opts?: { bits: number }): Promise<RSAPeerId> => {
  const key = await keys.generateKeyPair('RSA', opts?.bits ?? 2048)
  const id = await createFromPrivKey(key)

  if (id.type === 'RSA') {
    return id
  }

  throw new Error(`Generated unexpected PeerId type "${id.type}"`)
}

export async function createFromPubKey (publicKey: PublicKey) {
  return await PeerId.fromKeys(keys.marshalPublicKey(publicKey))
}

export async function createFromPrivKey (privateKey: PrivateKey) {
  return await PeerId.fromKeys(keys.marshalPublicKey(privateKey.public), keys.marshalPrivateKey(privateKey))
}

export function exportToProtobuf (peerId: RSAPeerId | Ed25519PeerId | Secp256k1PeerId, excludePrivateKey?: boolean) {
  return PeerIdProto.encode({
    id: peerId.multihash.bytes,
    pubKey: peerId.publicKey,
    privKey: excludePrivateKey === true || peerId.privateKey == null ? undefined : peerId.privateKey
  }).finish()
}

export async function createFromProtobuf (buf: Uint8Array) {
  const {
    id,
    privKey,
    pubKey
  } = PeerIdProto.decode(buf)

  return await createFromParts(
    id,
    privKey,
    pubKey
  )
}

export async function createFromJSON (obj: { id: string, privKey?: string, pubKey?: string }) {
  return await createFromParts(
    uint8ArrayFromString(obj.id, 'base58btc'),
    obj.privKey != null ? uint8ArrayFromString(obj.privKey, 'base64pad') : undefined,
    obj.pubKey != null ? uint8ArrayFromString(obj.pubKey, 'base64pad') : undefined
  )
}

async function createFromParts (multihash: Uint8Array, privKey?: Uint8Array, pubKey?: Uint8Array) {
  if (privKey != null) {
    const key = await keys.unmarshalPrivateKey(privKey)

    return await createFromPrivKey(key)
  } else if (pubKey != null) {
    const key = await keys.unmarshalPublicKey(pubKey)

    return await createFromPubKey(key)
  }

  return PeerId.fromBytes(multihash)
}

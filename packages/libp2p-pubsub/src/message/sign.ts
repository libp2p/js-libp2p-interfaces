import * as PeerIdFactory from '@libp2p/peer-id-factory'
import { RPC } from './rpc.js'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { normalizeOutRpcMessage } from '../utils.js'
import { PeerId } from '@libp2p/peer-id'
import { keys } from '@libp2p/crypto'
import type { Message } from '@libp2p/interfaces/pubsub'

export const SignPrefix = uint8ArrayFromString('libp2p-pubsub:')

/**
 * Signs the provided message with the given `peerId`
 */
export async function signMessage (peerId: PeerId, message: Message) {
  // Get the message in bytes, and prepend with the pubsub prefix
  const bytes = uint8ArrayConcat([
    SignPrefix,
    RPC.Message.encode(normalizeOutRpcMessage(message)).finish()
  ])

  if (peerId.privateKey == null) {
    throw new Error('Cannot sign message, no private key present')
  }

  if (peerId.publicKey == null) {
    throw new Error('Cannot sign message, no public key present')
  }

  const privateKey = await keys.unmarshalPrivateKey(peerId.privateKey)
  const signature = await privateKey.sign(bytes)

  const outputMessage: Message = {
    ...message,
    signature: signature,
    key: peerId.publicKey
  }

  return outputMessage
}

/**
 * Verifies the signature of the given message
 */
export async function verifySignature (message: Message) {
  if (message.signature == null) {
    throw new Error('Message must contain a signature to be verified')
  }

  if (message.from == null) {
    throw new Error('Message must contain a from property to be verified')
  }

  // Get message sans the signature
  const bytes = uint8ArrayConcat([
    SignPrefix,
    RPC.Message.encode({
      ...message,
      signature: undefined,
      key: undefined
    }).finish()
  ])

  // Get the public key
  const pubKeyBytes = await messagePublicKey(message)
  const pubKey = keys.unmarshalPublicKey(pubKeyBytes)

  // verify the base message
  return await pubKey.verify(bytes, message.signature)
}

/**
 * Returns the PublicKey associated with the given message.
 * If no, valid PublicKey can be retrieved an error will be returned.
 */
export async function messagePublicKey (message: Message) {
  // should be available in the from property of the message (peer id)
  if (message.from == null) {
    throw new Error('Could not get the public key from the originator id')
  }

  const from = PeerId.fromBytes(message.from)

  if (message.key != null) {
    const keyPeerId = await PeerIdFactory.createFromPubKey(keys.unmarshalPublicKey(message.key))

    // the key belongs to the sender, return the key
    if (!keyPeerId.equals(from)) {
      throw new Error('Public Key does not match the originator')
    }

    if (keyPeerId.publicKey != null) {
      return keyPeerId.publicKey
    }
  } else if (from.publicKey != null) {
    return from.publicKey
  }

  // We couldn't validate pubkey is from the originator, error
  throw new Error('Could not get the public key from the originator id')
}
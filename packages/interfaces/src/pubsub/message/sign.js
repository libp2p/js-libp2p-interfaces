'use strict'

const PeerId = require('peer-id')
const { RPC } = require('./rpc')
const { concat: uint8ArrayConcat } = require('uint8arrays/concat')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const SignPrefix = uint8ArrayFromString('libp2p-pubsub:')
const { normalizeOutRpcMessage } = require('../utils')

/**
 * @typedef {import('..').InMessage}
 */

/**
 * Signs the provided message with the given `peerId`
 *
 * @param {PeerId} peerId
 * @param {InMessage} message
 * @returns {Promise<InMessage>}
 */
async function signMessage (peerId, message) {
  // Get the message in bytes, and prepend with the pubsub prefix
  const bytes = uint8ArrayConcat([
    SignPrefix,
    RPC.Message.encode(normalizeOutRpcMessage(message)).finish()
  ])

  const signature = await peerId.privKey.sign(bytes)

  return {
    ...message,
    signature: signature,
    key: peerId.pubKey.bytes
  }
}

/**
 * Verifies the signature of the given message
 *
 * @param {InMessage} message
 * @returns {Promise<boolean>}
 */
async function verifySignature (message) {
  if (!message.signature) {
    throw new Error('Message must contain a signature to be verified')
  }

  if (!message.from) {
    throw new Error('Message must contain a from property to be verified')
  }

  // Get message sans the signature
  const bytes = uint8ArrayConcat([
    SignPrefix,
    RPC.Message.encode({
      ...message,
      from: PeerId.createFromB58String(message.from).toBytes(),
      signature: undefined,
      key: undefined
    }).finish()
  ])

  // Get the public key
  const pubKey = await messagePublicKey(message)

  // verify the base message
  return pubKey.verify(bytes, message.signature)
}

/**
 * Returns the PublicKey associated with the given message.
 * If no, valid PublicKey can be retrieved an error will be returned.
 *
 * @param {InMessage} message
 * @returns {Promise<PublicKey>}
 */
async function messagePublicKey (message) {
  // should be available in the from property of the message (peer id)
  if (!message.from) {
    throw new Error('Could not get the public key from the originator id')
  }

  const from = PeerId.createFromB58String(message.from)

  if (message.key) {
    const keyPeerId = await PeerId.createFromPubKey(message.key)

    // the key belongs to the sender, return the key
    if (keyPeerId.equals(from)) return keyPeerId.pubKey
    // We couldn't validate pubkey is from the originator, error
    throw new Error('Public Key does not match the originator')
  } else if (from.pubKey) {
    return from.pubKey
  } else {
    throw new Error('Could not get the public key from the originator id')
  }
}

/**
 * @typedef {import('..').InMessage} InMessage
 * @typedef {import('libp2p-crypto').PublicKey} PublicKey
 */

module.exports = {
  messagePublicKey,
  signMessage,
  SignPrefix,
  verifySignature
}

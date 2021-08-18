'use strict'

// @ts-ignore libp2p crypto has no types
const randomBytes = require('libp2p-crypto/src/random-bytes')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const PeerId = require('peer-id')
const { sha256 } = require('multiformats/hashes/sha2')

/**
 * @typedef {import('./message/rpc').RPC.IMessage} IMessage
 * @typedef {import('./message/rpc').RPC.Message} Message
 * @typedef {import('.').InMessage} NormalizedIMessage
 */

/**
 * Generatea random sequence number.
 *
 * @returns {Uint8Array}
 * @private
 */
const randomSeqno = () => {
  return randomBytes(8)
}

/**
 * Generate a message id, based on the `from` and `seqno`.
 *
 * @param {Uint8Array|string} from
 * @param {Uint8Array} seqno
 * @returns {Uint8Array}
 * @private
 */
const msgId = (from, seqno) => {
  let fromBytes

  if (from instanceof Uint8Array) {
    fromBytes = PeerId.createFromBytes(from).id
  } else {
    fromBytes = PeerId.parse(from).id
  }

  const msgId = new Uint8Array(fromBytes.length + seqno.length)
  msgId.set(fromBytes, 0)
  msgId.set(seqno, fromBytes.length)
  return msgId
}

/**
 * Generate a message id, based on message `data`.
 *
 * @param {Uint8Array} data
 * @private
 */
const noSignMsgId = (data) => sha256.encode(data)

/**
 * Check if any member of the first set is also a member
 * of the second set.
 *
 * @param {Set<number>|Array<number>} a
 * @param {Set<number>|Array<number>} b
 * @returns {boolean}
 * @private
 */
const anyMatch = (a, b) => {
  let bHas
  if (Array.isArray(b)) {
    /**
     * @param {number} val
     */
    bHas = (val) => b.indexOf(val) > -1
  } else {
    /**
     * @param {number} val
     */
    bHas = (val) => b.has(val)
  }

  for (const val of a) {
    if (bHas(val)) {
      return true
    }
  }

  return false
}

/**
 * Make everything an array.
 *
 * @template T
 * @param {T|T[]} maybeArray
 * @returns {T[]}
 * @private
 */
const ensureArray = (maybeArray) => {
  if (!Array.isArray(maybeArray)) {
    return [maybeArray]
  }

  return maybeArray
}

/**
 * Ensures `message.from` is base58 encoded
 *
 * @template {{from?:any}} T
 * @param {T & IMessage} message
 * @param {string} [peerId]
 * @returns {NormalizedIMessage}
 */
const normalizeInRpcMessage = (message, peerId) => {
  /** @type {NormalizedIMessage} */
  // @ts-ignore receivedFrom not yet defined
  const m = Object.assign({}, message)
  if (message.from instanceof Uint8Array) {
    m.from = uint8ArrayToString(message.from, 'base58btc')
  }
  if (peerId) {
    m.receivedFrom = peerId
  }
  return m
}

/**
 * @template {{from?:any, data?:any}} T
 *
 * @param {T & NormalizedIMessage} message
 * @returns {Message}
 */
const normalizeOutRpcMessage = (message) => {
  /** @type {Message} */
  // @ts-ignore from not yet defined
  const m = Object.assign({}, message)
  if (typeof message.from === 'string') {
    m.from = uint8ArrayFromString(message.from, 'base58btc')
  }
  if (typeof message.data === 'string') {
    m.data = uint8ArrayFromString(message.data)
  }
  return m
}

module.exports = {
  randomSeqno,
  msgId,
  noSignMsgId,
  anyMatch,
  ensureArray,
  normalizeInRpcMessage,
  normalizeOutRpcMessage
}

import { randomBytes } from 'iso-random-stream'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import PeerId from 'peer-id'
import { sha256 } from 'multiformats/hashes/sha2'
import type * as RPC from './message/rpc.js'
import type { Message } from 'libp2p-interfaces/pubsub'

/**
 * Generate a random sequence number
 */
export const randomSeqno = () => {
  return randomBytes(8)
}

/**
 * Generate a message id, based on the `from` and `seqno`
 */
export const msgId = (from: Uint8Array | string, seqno: Uint8Array) => {
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
 * Generate a message id, based on message `data`
 */
export const noSignMsgId = (data: Uint8Array) => sha256.encode(data)

/**
 * Check if any member of the first set is also a member
 * of the second set
 */
export const anyMatch = (a: Set<number> | number[], b: Set<number> | number[]) => {
  let bHas
  if (Array.isArray(b)) {
    bHas = (val: number) => b.includes(val)
  } else {
    bHas = (val: number) => b.has(val)
  }

  for (const val of a) {
    if (bHas(val)) {
      return true
    }
  }

  return false
}

/**
 * Make everything an array
 */
export const ensureArray = function <T> (maybeArray: T | T[]) {
  if (!Array.isArray(maybeArray)) {
    return [maybeArray]
  }

  return maybeArray
}

/**
 * Ensures `message.from` is base58 encoded
 */
export const normalizeInRpcMessage = (message: RPC.RPC.IMessage, peerId?: string) => {
  // @ts-expect-error receivedFrom not yet defined
  const m: NormalizedIMessage = Object.assign({}, message)

  if (peerId != null) {
    m.receivedFrom = peerId
  }

  return m
}

export const normalizeOutRpcMessage = (message: Message) => {
  const m: Message = Object.assign({}, message)
  if (typeof message.from === 'string') {
    m.from = uint8ArrayFromString(message.from, 'base58btc')
  }
  if (typeof message.data === 'string') {
    m.data = uint8ArrayFromString(message.data)
  }
  return m
}

import type { EventEmitter } from 'events'
import type { PeerId } from '../peer-id'
import type { Pushable } from 'it-pushable'
import type { Registrar } from '../registrar'

/**
 * On the producing side:
 * * Build messages with the signature, key (from may be enough for certain inlineable public key types), from and seqno fields.
 *
 * On the consuming side:
 * * Enforce the fields to be present, reject otherwise.
 * * Propagate only if the fields are valid and signature can be verified, reject otherwise.
 */
export type StrictSign = 'StrictSign'

/**
 * On the producing side:
 * * Build messages without the signature, key, from and seqno fields.
 * * The corresponding protobuf key-value pairs are absent from the marshalled message, not just empty.
 *
 * On the consuming side:
 * * Enforce the fields to be absent, reject otherwise.
 * * Propagate only if the fields are absent, reject otherwise.
 * * A message_id function will not be able to use the above fields, and should instead rely on the data field. A commonplace strategy is to calculate a hash.
 */
export type StrictNoSign = 'StrictNoSign'

export interface Message {
  from?: Uint8Array
  receivedFrom: string
  topicIDs: string[]
  seqno?: Uint8Array
  data: Uint8Array
  signature?: Uint8Array
  key?: Uint8Array
}

export interface PeerStreams extends EventEmitter {
  id: PeerId
  protocol: string
  outboundStream: Pushable<Uint8Array> | undefined
  inboundStream: AsyncIterable<Uint8Array> | undefined
}

export interface PubsubOptions {
  debugName?: string
  multicodecs: string[]
  libp2p: any

  /**
   * defines how signatures should be handled
   */
  globalSignaturePolicy?: StrictSign | StrictNoSign

  /**
   * if can relay messages not subscribed
   */
  canRelayMessage?: boolean

  /**
   * if publish should emit to self, if subscribed
   */
  emitSelf?: boolean

  /**
   * handle this many incoming pubsub messages concurrently
   */
  messageProcessingConcurrency?: number
}

export interface PubSub extends EventEmitter {
  peerId: PeerId
  started: boolean
  peers: Map<string, PeerStreams>
  subscriptions: Set<string>
  topics: Map<string, Set<string>>
  globalSignaturePolicy: StrictSign | StrictNoSign
  registrar: Registrar

  start: () => void
  stop: () => void
  getTopics: () => string[]
  subscribe: (topic: string) => void
  getSubscribers: (topic: string) => string[]
  unsubscribe: (topic: string) => void
  publish: (topic: string, data: Uint8Array) => Promise<void>
  validate: (message: Message) => Promise<void>
}

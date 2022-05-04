import type { PeerId } from '../peer-id/index.js'
import type { Pushable } from 'it-pushable'
import type { EventEmitter } from '../events.js'
import type { Stream } from '../connection/index.js'

/**
 * On the producing side:
 * * Build messages with the signature, key (from may be enough for certain inlineable public key types), from and seqno fields.
 *
 * On the consuming side:
 * * Enforce the fields to be present, reject otherwise.
 * * Propagate only if the fields are valid and signature can be verified, reject otherwise.
 */
export const StrictSign = 'StrictSign'

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
export const StrictNoSign = 'StrictNoSign'

export type SignaturePolicy = typeof StrictSign | typeof StrictNoSign

export interface Message {
  from: PeerId
  topic: string
  data: Uint8Array
  sequenceNumber?: bigint
  signature?: Uint8Array
  key?: Uint8Array
}

export interface PubSubRPCMessage {
  from?: Uint8Array
  topic?: string
  data?: Uint8Array
  sequenceNumber?: Uint8Array
  signature?: Uint8Array
  key?: Uint8Array
}

export interface PubSubRPCSubscription {
  subscribe?: boolean
  topic?: string
}

export interface PubSubRPC {
  subscriptions: PubSubRPCSubscription[]
  messages: PubSubRPCMessage[]
}

export interface PeerStreams extends EventEmitter<PeerStreamEvents> {
  id: PeerId
  protocol: string
  outboundStream?: Pushable<Uint8Array>
  inboundStream?: AsyncIterable<Uint8Array>
  isWritable: boolean

  close: () => void
  write: (buf: Uint8Array) => void
  attachInboundStream: (stream: Stream) => AsyncIterable<Uint8Array>
  attachOutboundStream: (stream: Stream) => Promise<Pushable<Uint8Array>>
}

export interface PubSubInit {
  enabled?: boolean

  multicodecs?: string[]

  /**
   * defines how signatures should be handled
   */
  globalSignaturePolicy?: SignaturePolicy

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

interface Subscription {
  topic: string
  subscribe: boolean
}

export interface SubscriptionChangeData {
  peerId: PeerId
  subscriptions: Subscription[]
}

export interface PubSubEvents {
  'subscription-change': CustomEvent<SubscriptionChangeData>
  'message': CustomEvent<Message>
}

export interface PublishResult {
  recipients: PeerId[]
}

export interface PubSub<Events = PubSubEvents> extends EventEmitter<Events> {
  globalSignaturePolicy: typeof StrictSign | typeof StrictNoSign
  multicodecs: string[]

  getPeers: () => PeerId[]
  getTopics: () => string[]
  subscribe: (topic: string) => void
  unsubscribe: (topic: string) => void
  getSubscribers: (topic: string) => PeerId[]
  publish: (topic: string, data: Uint8Array) => Promise<PublishResult>
}

export interface PeerStreamEvents {
  'stream:inbound': CustomEvent<never>
  'stream:outbound': CustomEvent<never>
  'close': CustomEvent<never>
}

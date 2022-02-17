import type { PeerId } from '../peer-id/index.js'
import type { Pushable } from 'it-pushable'
import type { Registrar } from '../registrar/index.js'
import type { EventEmitter, Startable } from '../index.js'
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

export interface Message {
  from: PeerId
  topicIDs: string[]
  seqno?: BigInt
  data: Uint8Array
  signature?: Uint8Array
  key?: Uint8Array
}

export interface RPCMessage {
  from: Uint8Array
  data: Uint8Array
  topicIDs: string[]
  seqno?: Uint8Array
  signature?: Uint8Array
  key?: Uint8Array
}

export interface RPCSubscription {
  subscribe: boolean
  topicID: string
}

export interface RPC {
  subscriptions: RPCSubscription[]
  msgs: RPCMessage[]
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

export interface PubSubOptions {
  registrar: Registrar
  peerId: PeerId
  debugName?: string
  multicodecs?: string[]

  /**
   * defines how signatures should be handled
   */
  globalSignaturePolicy?: typeof StrictSign | typeof StrictNoSign

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
  topicID: string
  subscribe: boolean
}

interface SubscriptionChangeData {
  peerId: PeerId
  subscriptions: Subscription[]
}

export interface PubSubEvents {
  'pubsub:subscription-change': CustomEvent<SubscriptionChangeData>
}

export interface PubSub<EventMap extends PubSubEvents> extends EventEmitter<EventMap>, Startable {
  globalSignaturePolicy: typeof StrictSign | typeof StrictNoSign
  multicodecs: string[]

  getPeers: () => PeerId[]
  getTopics: () => string[]
  subscribe: (topic: string) => void
  getSubscribers: (topic: string) => PeerId[]
  unsubscribe: (topic: string) => void
  publish: (topic: string, data: Uint8Array) => Promise<void>
  validate: (message: Message) => Promise<void>

  processRpc: (from: PeerId, peerStreams: PeerStreams, rpc: RPC) => Promise<boolean>
  emitMessage: (message: Message) => void
}

export interface PeerStreamEvents {
  'stream:inbound': CustomEvent<never>
  'stream:outbound': CustomEvent<never>
  'close': CustomEvent<never>
}

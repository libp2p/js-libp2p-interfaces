import type { PeerId } from '../peer-id'
import type { CID } from 'multiformats/cid'
import type { PublicKey } from '../keys'
import type { PeerData } from '../peer-data'
import type { AbortOptions } from '../index'

/**
 * The types of events emitted during DHT queries
 */
export enum EventTypes {
  SendingQuery = 0,
  PeerResponse,
  FinalPeer,
  QueryError,
  Provider,
  Value,
  AddingPeer,
  DialingPeer
}

/**
 * The types of messages set/received during DHT queries
 */
export enum MessageType {
  PutValue = 0,
  GetValue,
  AddProvider,
  GetProviders,
  FindNode,
  Ping
}

export type MessageName = 'putValue' | 'getValue' | 'addProvider' | 'getProviders' | 'findNode' | 'ping'

export interface DHTRecord {
  key: Uint8Array
  value: Uint8Array
  timeReceived?: Date
}

export interface QueryOptions extends AbortOptions {
  queryFuncTimeout?: number
}

/**
 * Emitted when sending queries to remote peers
 */
export interface SendingQueryEvent {
  to: PeerId
  type: EventTypes.SendingQuery
  name: 'sendingQuery'
  message: string
  messageType: number
}

/**
 * Emitted when query responses are received form remote peers.  Depending on the query
 * these events may be followed by a `FinalPeerEvent`, a `ValueEvent` or a `ProviderEvent`.
 */
export interface PeerResponseEvent {
  from: PeerId
  type: EventTypes.PeerResponse
  name: 'peerResponse'
  messageType: MessageType
  messageName: MessageName
  closer: PeerData[]
  providers: PeerData[]
  record?: DHTRecord
}

/**
 * Emitted at the end of a `findPeer` query
 */
export interface FinalPeerEvent {
  from: PeerId
  peer: PeerData
  type: EventTypes.FinalPeer
  name: 'finalPeer'
}

/**
 * Something went wrong with the query
 */
export interface QueryErrorEvent {
  from: PeerId
  type: EventTypes.QueryError
  name: 'queryError'
  error: Error
}

/**
 * Emitted when providers are found
 */
export interface ProviderEvent {
  from: PeerId
  type: EventTypes.Provider
  name: 'provider'
  providers: PeerData[]
}

/**
 * Emitted when values are found
 */
export interface ValueEvent {
  from: PeerId
  type: EventTypes.Value
  name: 'value'
  value: Uint8Array
}

/**
 * Emitted when peers are added to a query
 */
export interface AddingPeerEvent {
  type: EventTypes.AddingPeer
  name: 'addingPeer'
  peer: PeerId
}

/**
 * Emitted when peers are dialled as part of a query
 */
export interface DialingPeerEvent {
  peer: PeerId
  type: EventTypes.DialingPeer
  name: 'dialingPeer'
}

export type QueryEvent = SendingQueryEvent | PeerResponseEvent | FinalPeerEvent | QueryErrorEvent | ProviderEvent | ValueEvent | AddingPeerEvent | DialingPeerEvent

export interface DHT {
  /**
   * Get a value from the DHT, the final ValueEvent will be the best value
   */
  get: (key: Uint8Array, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Find providers for a given CI
   */
  findProviders: (key: CID, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Find a peer on the DHT
   */
  findPeer: (id: PeerId, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Find the closest peers to the passed key
   */
  getClosestPeers: (key: Uint8Array, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Get the public key for a peer
   */
  getPublicKey: (peer: PeerId, options?: QueryOptions) => Promise<PublicKey>

  /**
   * Store provider records for the passed CID on the DHT pointing to us
   */
  provide: (key: CID, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Store the passed value under the passed key on the DHT
   */
  put: (key: Uint8Array, value: Uint8Array, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Enable server mode (e.g. allow publishing provider records)
   */
  enableServerMode: () => void

  /**
   * Enable server mode (e.g. disallow publishing provider records)
   */
  enableClientMode: () => void
}

export interface SelectFn { (key: Uint8Array, records: Uint8Array[]): number }
export interface ValidateFn { (a: Uint8Array, b: Uint8Array): Promise<void> }

export interface Selectors { [key: string]: SelectFn }
export interface Validators { [key: string]: { func: ValidateFn } }

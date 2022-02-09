import type { PeerId } from '../peer-id'
import type { CID } from 'multiformats/cid'
import type { PeerData } from '../peer-data'
import type { AbortOptions } from '../index'

/**
 * The types of events emitted during DHT queries
 */
export enum EventTypes {
  SENDING_QUERY = 0,
  PEER_RESPONSE,
  FINAL_PEER,
  QUERY_ERROR,
  PROVIDER,
  VALUE,
  ADDING_PEER,
  DIALING_PEER
}

/**
 * The types of messages sent to peers during DHT queries
 */
export enum MessageType {
  PUT_VALUE = 0,
  GET_VALUE,
  ADD_PROVIDER,
  GET_PROVIDERS,
  FIND_NODE,
  PING
}

export type MessageName = keyof typeof MessageType

export interface DHTRecord {
  key: Uint8Array
  value: Uint8Array
  timeReceived?: Date
}

export interface QueryOptions extends AbortOptions {
  queryFuncTimeout?: number
  minPeers?: number
}

/**
 * Emitted when sending queries to remote peers
 */
export interface SendingQueryEvent {
  to: PeerId
  type: EventTypes.SENDING_QUERY
  name: 'SENDING_QUERY'
  messageName: keyof typeof MessageType
  messageType: MessageType
}

/**
 * Emitted when query responses are received form remote peers.  Depending on the query
 * these events may be followed by a `FinalPeerEvent`, a `ValueEvent` or a `ProviderEvent`.
 */
export interface PeerResponseEvent {
  from: PeerId
  type: EventTypes.PEER_RESPONSE
  name: 'PEER_RESPONSE'
  messageName: keyof typeof MessageType
  messageType: MessageType
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
  type: EventTypes.FINAL_PEER
  name: 'FINAL_PEER'
}

/**
 * Something went wrong with the query
 */
export interface QueryErrorEvent {
  from: PeerId
  type: EventTypes.QUERY_ERROR
  name: 'QUERY_ERROR'
  error: Error
}

/**
 * Emitted when providers are found
 */
export interface ProviderEvent {
  from: PeerId
  type: EventTypes.PROVIDER
  name: 'PROVIDER'
  providers: PeerData[]
}

/**
 * Emitted when values are found
 */
export interface ValueEvent {
  from: PeerId
  type: EventTypes.VALUE
  name: 'VALUE'
  value: Uint8Array
}

/**
 * Emitted when peers are added to a query
 */
export interface AddingPeerEvent {
  type: EventTypes.ADDING_PEER
  name: 'ADDING_PEER'
  peer: PeerId
}

/**
 * Emitted when peers are dialled as part of a query
 */
export interface DialingPeerEvent {
  peer: PeerId
  type: EventTypes.DIALING_PEER
  name: 'DIALING_PEER'
}

export type QueryEvent = SendingQueryEvent | PeerResponseEvent | FinalPeerEvent | QueryErrorEvent | ProviderEvent | ValueEvent | AddingPeerEvent | DialingPeerEvent

export interface DHT {
  /**
   * Get a value from the DHT, the final ValueEvent will be the best value
   */
  get: (key: Uint8Array, options?: QueryOptions) => AsyncIterable<QueryEvent>

  /**
   * Find providers of a given CID
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

  /**
   * Force a routing table refresh
   */
  refreshRoutingTable: () => Promise<void>

  // events
  on: (event: 'peer', handler: (peerData: PeerData) => void) => this
}

export interface SelectFn { (key: Uint8Array, records: Uint8Array[]): number }
export interface ValidateFn { (a: Uint8Array, b: Uint8Array): Promise<void> }

export interface Selectors { [key: string]: SelectFn }
export interface Validators { [key: string]: { func: ValidateFn } }

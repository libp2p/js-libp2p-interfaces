import type { PeerId } from '../peer-id'
import type { CID } from 'multiformats/cid'
import type { PublicKey } from '../keys'
import type { PeerData } from '../peer-data'
import type { AbortOptions } from '../index'

export enum MessageTypes {
  SendingQuery = 0,
  PeerResponse,
  FinalPeer,
  QueryError,
  Provider,
  Value,
  AddingPeer,
  DialingPeer
}

export interface DHTValue {
  value: Uint8Array
  from: PeerId
}

export interface QueryOptions extends AbortOptions {
  queryFuncTimeout?: number
}

export interface SendingQueryEvent {
  to: PeerId
  type: MessageTypes.SendingQuery
  name: 'sendingQuery'
  message: string
  messageType: number
}

export interface PeerResponseEvent {
  from: PeerId
  type: MessageTypes.PeerResponse
  name: 'peerResponse'
  closer: PeerData[]
}

export interface FinalPeerEvent {
  from: PeerId
  peer: PeerData
  type: MessageTypes.FinalPeer
  name: 'finalPeer'
}

export interface QueryErrorEvent {
  from: PeerId
  type: MessageTypes.QueryError
  name: 'queryError'
  error: Error
}

export interface ProviderEvent {
  from: PeerId
  type: MessageTypes.Provider
  name: 'provider'
  providers: PeerData[]
}

export interface ValueEvent {
  from: PeerId
  type: MessageTypes.Value
  name: 'value'
  value: Uint8Array
}

export interface AddingPeerEvent {
  type: MessageTypes.AddingPeer
  name: 'addingPeer'
  peer: PeerId
}

export interface DialingPeerEvent {
  peer: PeerId
  type: MessageTypes.DialingPeer
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

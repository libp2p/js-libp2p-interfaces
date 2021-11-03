import type PeerId from 'peer-id'

export interface GetValueResult {
  from: PeerId,
  val: Uint8Array,
}

export interface ValueStore {
  put (key: Uint8Array, value: Uint8Array, options?: Object): Promise<void>
  get (key: Uint8Array, options?: Object): Promise<GetValueResult>
}

export default ValueStore

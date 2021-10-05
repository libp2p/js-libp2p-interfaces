
export interface ValueStore {
  put (key: Uint8Array, value: Uint8Array, options?: Object): Promise<void>
  get (key: Uint8Array, options?: Object): Promise<Uint8Array>
}

export default ValueStore

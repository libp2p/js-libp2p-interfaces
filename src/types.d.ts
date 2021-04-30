export type SelectFn = (key: Uint8Array, records: Uint8Array[]) => number
export type ValidateFn = (a: Uint8Array, b: Uint8Array) => Promise<void>

export type DhtSelectors = { [key: string]: SelectFn }
export type DhtValidators = { [key: string]: { func: ValidateFn } }

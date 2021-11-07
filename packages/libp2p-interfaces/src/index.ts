export interface SelectFn { (key: Uint8Array, records: Uint8Array[]): number }
export interface ValidateFn { (a: Uint8Array, b: Uint8Array): Promise<void> }

export interface DhtSelectors { [key: string]: SelectFn }
export interface DhtValidators { [key: string]: { func: ValidateFn } }

export interface AbortOptions {
  signal?: AbortSignal
}

export interface Startable {
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
}

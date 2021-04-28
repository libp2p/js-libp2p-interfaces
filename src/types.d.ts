export type SelectFn = (key: Uint8Array, records: Uint8Array[]) => number
export type ValidateFn = (a: Uint8Array, b: Uint8Array) => Promise<void>

export type DhtSelectors = { [key: string]: SelectFn }
export type DhtValidators = { [key: string]: { func: ValidateFn } }

export interface EventEmitterFactory {
  new(): EventEmitter;
}

export interface EventEmitter {
  addListener(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
  on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
  once(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
  off(event: string | symbol, listener: (...args: any[]) => void): EventEmitter;
  removeAllListeners(event?: string | symbol): EventEmitter;
  setMaxListeners(n: number): EventEmitter;
  getMaxListeners(): number;
  listeners(event: string | symbol): Function[]; // eslint-disable-line @typescript-eslint/ban-types
  rawListeners(event: string | symbol): Function[]; // eslint-disable-line @typescript-eslint/ban-types
  emit(event: string | symbol, ...args: any[]): boolean;
  listenerCount(event: string | symbol): number;
}

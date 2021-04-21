export type DhtSelectors = { [key: string]: function (Uint8Array, Uint8Array[]): number }
export type DhtValidators = { [key: string]: { func: (key: Uint8Array, value: Uint8Array) => Promise<void> } }

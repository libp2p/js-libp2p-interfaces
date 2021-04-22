export type SelectFn = function (Uint8Array, Uint8Array[]): number
export type ValidateFn = function (Uint8Array, Uint8Array): Promise<void>

export type DhtSelectors = { [key: string]: SelectFn }
export type DhtValidators = { [key: string]: { func: ValidateFn } }

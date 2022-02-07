import debug from 'debug'
import { base58btc } from 'multiformats/bases/base58'
import { base32 } from 'multiformats/bases/base32'
import type { PeerId } from '@libp2p/interfaces/peer-id'

// Add a formatter for converting to a base58 string
debug.formatters.b = (v: Uint8Array) => {
  return base58btc.baseEncode(v)
}

// Add a formatter for converting to a base32 string
debug.formatters.t = (v: Uint8Array) => {
  return base32.baseEncode(v)
}

// Add a formatter for stringifying peer ids
debug.formatters.p = (p: PeerId) => {
  return p.toString(base58btc)
}

export interface Logger {
  (formatter: any, ...args: any[]): void
  error: (formatter: any, ...args: any[]) => void
  enabled: boolean
}

export function logger (name: string): Logger {
  return Object.assign(debug(name), {
    error: debug(`${name}:error`)
  })
}

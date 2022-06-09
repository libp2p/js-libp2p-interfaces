import type { Duplex } from 'it-stream-types'

export function mockDuplex (): Duplex<Uint8Array> {
  return {
    source: [],
    sink: async () => {}
  }
}

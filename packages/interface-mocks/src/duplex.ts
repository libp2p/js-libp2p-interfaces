import type { Duplex } from 'it-stream-types'

export function mockDuplex (): Duplex<Iterable<Uint8Array>> {
  return {
    source: [],
    sink: async () => {}
  }
}

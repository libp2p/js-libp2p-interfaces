import type { Connection, Stream } from '../connection/index.js'
import type { Topology } from '../topology/index.js'

export interface IncomingStreamData {
  protocol: string
  stream: Stream
  connection: Connection
}

export interface StreamHandler {
  (data: IncomingStreamData): void
}

export interface Registrar {
  getProtocols: () => string[]
  handle: (protocol: string | string[], handler: StreamHandler) => Promise<void>
  unhandle: (protocol: string | string[]) => Promise<void>
  getHandler: (protocol: string) => StreamHandler

  register: (protocols: string | string[], topology: Topology) => Promise<string>
  unregister: (id: string) => void
  getTopologies: (protocol: string) => Topology[]
}

import type { PeerId } from '../peer-id/index.js'

/**
 * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
 */
export interface Record {
  /**
   * signature domain.
   */
  domain: string
  /**
   * identifier of the type of record
   */
  codec: Uint8Array
  /**
   * Marshal a record to be used in an envelope.
   */
  marshal: () => Uint8Array
  /**
   * Verifies if the other provided Record is identical to this one.
   */
  equals: (other: Record) => boolean
}

export interface Envelope {
  peerId: PeerId
  payloadType: Uint8Array
  payload: Uint8Array
  signature: Uint8Array

  marshal: () => Uint8Array
  validate: (domain: string) => Promise<boolean>
  equals: (other: Envelope) => boolean
}

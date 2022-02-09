import { Multiaddr } from '@multiformats/multiaddr'
import { PeerId } from '@libp2p/peer-id'
import { arrayEquals } from '@libp2p/utils/array-equals'
import { PeerRecord as Protobuf } from './peer-record.js'
import {
  ENVELOPE_DOMAIN_PEER_RECORD,
  ENVELOPE_PAYLOAD_TYPE_PEER_RECORD
} from './consts.js'

export interface PeerRecordOptions {
  peerId: PeerId

  /**
   * Addresses of the associated peer.
   */
  multiaddrs?: Multiaddr[]

  /**
   * Monotonically-increasing sequence counter that's used to order PeerRecords in time.
   */
  seqNumber?: number
}

/**
 * The PeerRecord is used for distributing peer routing records across the network.
 * It contains the peer's reachable listen addresses.
 */
export class PeerRecord {
  /**
   * Unmarshal Peer Record Protobuf.
   *
   * @param {Uint8Array} buf - marshaled peer record.
   * @returns {PeerRecord}
   */
  static createFromProtobuf = (buf: Uint8Array) => {
    const peerRecord = Protobuf.decode(buf)
    const peerId = PeerId.fromBytes(peerRecord.peerId)
    const multiaddrs = (peerRecord.addresses ?? []).map((a) => new Multiaddr(a.multiaddr))
    const seqNumber = Number(peerRecord.seq)

    return new PeerRecord({ peerId, multiaddrs, seqNumber })
  }

  static DOMAIN = ENVELOPE_DOMAIN_PEER_RECORD
  static CODEC = ENVELOPE_PAYLOAD_TYPE_PEER_RECORD

  public peerId: PeerId
  public multiaddrs: Multiaddr[]
  public seqNumber: number
  public domain = PeerRecord.DOMAIN
  public codec = PeerRecord.CODEC
  private marshaled?: Uint8Array

  constructor (options: PeerRecordOptions) {
    const { peerId, multiaddrs, seqNumber } = options

    this.peerId = peerId
    this.multiaddrs = multiaddrs ?? []
    this.seqNumber = seqNumber ?? Date.now()
  }

  /**
   * Marshal a record to be used in an envelope
   */
  marshal () {
    if (this.marshaled == null) {
      this.marshaled = Protobuf.encode({
        peerId: this.peerId.toBytes(),
        seq: this.seqNumber,
        addresses: this.multiaddrs.map((m) => ({
          multiaddr: m.bytes
        }))
      }).finish()
    }

    return this.marshaled
  }

  /**
   * Returns true if `this` record equals the `other`
   */
  equals (other: unknown) {
    if (!(other instanceof PeerRecord)) {
      return false
    }

    // Validate PeerId
    if (!this.peerId.equals(other.peerId)) {
      return false
    }

    // Validate seqNumber
    if (this.seqNumber !== other.seqNumber) {
      return false
    }

    // Validate multiaddrs
    if (!arrayEquals(this.multiaddrs, other.multiaddrs)) {
      return false
    }

    return true
  }
}

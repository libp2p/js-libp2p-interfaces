import type { PeerId } from '@libp2p/interface-peer-id'
import type { Duplex } from 'it-stream-types'

export interface MetricsInit {
  enabled: boolean
  computeThrottleMaxQueueSize: number
  computeThrottleTimeout: number
  movingAverageIntervals: number[]
  maxOldPeersRetention: number
}

export interface MovingAverage {
  variance: number
  movingAverage: number
  deviation: number
  forecast: number

  push: (time: number, value: number) => void
}

export interface MovingAverages {
  dataReceived: MovingAverage[]
  dataSent: MovingAverage[]
}

export interface TransferStats {
  dataReceived: bigint
  dataSent: bigint
}

export interface Stats {
  /**
   * Returns a clone of the current stats.
   */
  getSnapshot: () => TransferStats

  /**
   * Returns a clone of the internal movingAverages
   */
  getMovingAverages: () => MovingAverages

  /**
   * Pushes the given operation data to the queue, along with the
   * current Timestamp, then resets the update timer.
   */
  push: (counter: string, inc: number) => void
}

export interface TrackStreamOptions {
  /**
   * A duplex iterable stream
   */
  stream: Duplex<{ byteLength: number }, any>

  /**
   * The id of the remote peer that's connected
   */
  remotePeer: PeerId

  /**
   * The protocol the stream is running
   */
  protocol?: string
}

export interface StreamMetrics {
  /**
   * Returns the global `Stats` object
   */
  getGlobal: () => Stats

  /**
   * Returns a list of `PeerId` strings currently being tracked
   */
  getPeers: () => string[]

  /**
   * Returns the `Stats` object for the given `PeerId` whether it
   * is a live peer, or in the disconnected peer LRU cache.
   */
  forPeer: (peerId: PeerId) => Stats | undefined

  /**
   * Returns a list of all protocol strings currently being tracked.
   */
  getProtocols: () => string[]

  /**
   * Returns the `Stats` object for the given `protocol`
   */
  forProtocol: (protocol: string) => Stats | undefined

  /**
   * Should be called when all connections to a given peer
   * have closed. The `Stats` collection for the peer will
   * be stopped and moved to an LRU for temporary retention.
   */
  onPeerDisconnected: (peerId: PeerId) => void

  /**
   * Replaces the `PeerId` string with the given `peerId`.
   * If stats are already being tracked for the given `peerId`, the
   * placeholder stats will be merged with the existing stats.
   */
  updatePlaceholder: (placeholder: PeerId, peerId: PeerId) => void

  /**
   * Tracks data running through a given Duplex Iterable `stream`. If
   * the `peerId` is not provided, a placeholder string will be created and
   * returned. This allows lazy tracking of a peer when the peer is not yet known.
   * When the `PeerId` is known, `Metrics.updatePlaceholder` should be called
   * with the placeholder string returned from here, and the known `PeerId`.
   */
  trackStream: (data: TrackStreamOptions) => void
}

/**
 * Used to update a tracked metric. Value can either be a number, an object containing
 * key/value pairs or an (optionally async) function to return a number or an object of
 * key/value pairs.
 */
export interface ComponentMetricsUpdate {
  /**
   * Name of the system, e.g. libp2p, ipfs, etc
   */
  system: string

  /**
   * Name of the system component that contains the metric
   */
  component: string

  /**
   * Name of the metric being tracked
   */
  metric: string

  /**
   * The value or function to calculate the value
   */
  value: ComponentMetric | CalculateComponentMetric

  /**
   * Optional label for the metric
   */
  label?: string

  /**
   * Optional help for the metric
   */
  help?: string
}

export type ComponentMetric = number | ComponentMetricsGroup

/**
 * Used to group related metrics together by label and value
 */
export type ComponentMetricsGroup = Record<string, number>

/**
 * Used to calculate metric values dynamically
 */
export interface CalculateComponentMetric { (): Promise<ComponentMetric> | ComponentMetric }

export interface TrackedMetric {
  /**
   * In systems that support them, this label can help make graphs more interpretable
   */
  label?: string

  /**
   * In systems that support them, this help text can help make graphs more interpretable
   */
  help?: string

  /**
   * A function that returns a value or a group of values
   */
  calculate: CalculateComponentMetric
}

export interface ComponentMetricsTracker {
  /**
   * Returns tracked metrics key by system, component, metric, value
   */
  getComponentMetrics: () => Map<string, Map<string, Map<string, TrackedMetric>>>

  /**
   * Update the stored metric value for the given system and component
   */
  updateComponentMetric: (data: ComponentMetricsUpdate) => void
}

export interface Metrics extends StreamMetrics, ComponentMetricsTracker {

}

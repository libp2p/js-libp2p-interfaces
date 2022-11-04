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

/**
 * Create tracked metrics with these options. Loosely based on the
 * interfaces exposed by the prom-client module
 */
export interface MetricOptions {
  /**
   * Optional label for the metric
   */
  label?: string

  /**
   * Optional help for the metric
   */
  help?: string
}

/**
 * A function that returns a tracked metric which may be expensive
 * to calculate so it is only invoked when metrics are being scraped
 */
export type CalculateMetric<T = number> = (() => T) | (() => Promise<T>)

/**
 * Create tracked metrics that are expensive to calculate by passing
 * a function that is only invoked when metrics are being scraped
 */
export interface CalculatedMetricOptions<T = number> extends MetricOptions {
  /**
   * An optional function invoked to calculate the component metric instead of
   * using `.update`, `.increment`, and `.decrement`
   */
  calculate: CalculateMetric<T>
}

/**
 * Call this function to stop the timer returned from the `.timer` method
 * on the metric
 */
export interface StopTimer { (): void }

/**
 * A tracked metric loosely based on the interfaces exposed by the
 * prom-client module
 */
export interface Metric {
  /**
   * Update the stored metric to the passed value
   */
  update: (value: number) => void

  /**
   * Increment the metric by the passed value or 1
   */
  increment: (value?: number) => void

  /**
   * Decrement the metric by the passed value or 1
   */
  decrement: (value?: number) => void

  /**
   * Reset this metric to its default value
   */
  reset: () => void

  /**
   * Start a timed metric, call the returned function to
   * stop the timer
   */
  timer: () => StopTimer
}

/**
 * A group of related metrics loosely based on the interfaces exposed by the
 * prom-client module
 */
export interface MetricGroup {
  /**
   * Update the stored metric group to the passed value
   */
  update: (values: Record<string, number>) => void

  /**
   * Increment the metric group keys by the passed number or
   * any non-numeric value to increment by 1
   */
  increment: (values: Record<string, number | unknown>) => void

  /**
   * Decrement the metric group keys by the passed number or
   * any non-numeric value to decrement by 1
   */
  decrement: (values: Record<string, number | unknown>) => void

  /**
   * Reset the passed key in this metric group to its default value
   * or all keys if no key is passed
   */
  reset: () => void

  /**
   * Start a timed metric for the named key in the group, call
   * the returned function to stop the timer
   */
  timer: (key: string) => StopTimer
}

/**
 * The libp2p metrics tracking object. This interface is only concerned
 * with the collection of metrics, please see the individual implementations
 * for how to extract metrics for viewing.
 */
export interface Metrics {
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

  /**
   * Register an arbitrary metric. Call this to set help/labels for metrics
   * and update/increment/decrement/etc them by calling methods on the returned
   * metric object
   */
  registerMetric: ((name: string, options?: MetricOptions) => Metric) & ((name: string, options: CalculatedMetricOptions) => void)

  /**
   * Register a a group of related metrics. Call this to set help/labels for
   * groups of related metrics that will be updated with by calling `.update`,
   * `.increment` and/or `.decrement` methods on the returned metric group object
   */
  registerMetricGroup: ((name: string, options?: MetricOptions) => MetricGroup) & ((name: string, options: CalculatedMetricOptions<Record<string, number>>) => void)
}

import type { Startable } from ".."
import type { PeerId } from "../peer-id"
import type { MultiaddrConnection } from "../transport"

export interface MovingAverage {
  variance: () => number
  movingAverage: () => number

  deviation: () => number
  forecast: () => number

  push: (time: number, value: number) => void
}

export interface MovingAverages {
  dataReceived: MovingAverage[]
  dataSent: MovingAverage[]
}

export interface StatsJSON {
  dataReceived: string
  dataSent: string
  movingAverages: Record<string, Record<string, number>>
}

export interface Stats extends Startable {
    /**
     * Returns a clone of the current stats.
     */
    getSnapshot: Record<string, any>

    /**
     * Returns a clone of the internal movingAverages
     */
    getMovingAverages (): MovingAverages

    /**
     * Returns a plain JSON object of the stats
     */
    toJSON (): StatsJSON

    /**
     * Pushes the given operation data to the queue, along with the
     * current Timestamp, then resets the update timer.
     */
    push (counter: string, inc: number): void
}


export interface Metrics extends Startable {
  /**
   * Returns the global `Stats` object
   */
  getGlobal (): Stats

  /**
   * Returns a list of `PeerId` strings currently being tracked
   */
  getPeers (): string[]

  /**
   * Returns the `Stats` object for the given `PeerId` whether it
   * is a live peer, or in the disconnected peer LRU cache.
   */
  forPeer (peerId: PeerId): Stats

  /**
   * Returns a list of all protocol strings currently being tracked.
   */
  getProtocols (): string[]

  /**
   * Returns the `Stats` object for the given `protocol`.
   *
   * @param {string} protocol
   * @returns {Stats}
   */
  forProtocol (protocol: string): Stats

  /**
   * Should be called when all connections to a given peer
   * have closed. The `Stats` collection for the peer will
   * be stopped and moved to an LRU for temporary retention.
   */
  onPeerDisconnected (peerId: PeerId): void

  /**
   * Replaces the `PeerId` string with the given `peerId`.
   * If stats are already being tracked for the given `peerId`, the
   * placeholder stats will be merged with the existing stats.
   */
  updatePlaceholder (placeholder: PeerId, peerId: PeerId): void

  /**
   * Tracks data running through a given Duplex Iterable `stream`. If
   * the `peerId` is not provided, a placeholder string will be created and
   * returned. This allows lazy tracking of a peer when the peer is not yet known.
   * When the `PeerId` is known, `Metrics.updatePlaceholder` should be called
   * with the placeholder string returned from here, and the known `PeerId`.
   */
  trackStream (data: { stream: MultiaddrConnection, remotePeer: PeerId, protocol: string }): MultiaddrConnection
}

export interface ComponentMetricsUpdate {
  system: string,
  component: string,
  metric: string,
  value: number
}

export interface ComponentMetricsTracker {
  /**
   * Returns tracked metrics key by system, component, metric, value
   */
  getComponentMetrics (): Map<string, Map<string, Map<string, string>>>

   /**
    * Update the stored metric value for the given system and component
    */
  updateComponentMetric (data: ComponentMetricsUpdate): void
}

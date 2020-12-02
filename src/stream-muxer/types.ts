/**
 * A libp2p stream muxer
 */
export interface Muxer {
  multicodec: string;
  readonly streams: Array<MuxedStream>;
  /**
   * Initiate a new stream with the given name. If no name is
   * provided, the id of th stream will be used.
   */
  newStream (name?: string): MuxedStream;

  /**
   * A function called when receiving a new stream from the remote.
   */
  onStream (stream: MuxedStream): void;

  /**
   * A function called when a stream ends.
   */
  onStreamEnd (stream: MuxedStream): void;
}

export type MuxedTimeline = {
  open: number;
  close?: number;
}

export type MuxedStream = {
  close: () => void;
  abort: () => void;
  reset: () => void;
  sink: Sink;
  source: () => AsyncIterable<Uint8Array>;
  timeline: MuxedTimeline;
  id: string;
  [Symbol.asyncIterator](): AsyncIterator<Uint8Array>;
}

type Sink = (source: Uint8Array) => Promise<Uint8Array>;

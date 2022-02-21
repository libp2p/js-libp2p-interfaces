import { expect } from 'aegir/utils/chai.js'
import { duplexPair } from 'it-pair/duplex'
import { pipe } from 'it-pipe'
import drain from 'it-drain'
import map from 'it-map'
import all from 'it-all'
import defer from 'p-defer'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isValidTick } from '../utils/is-valid-tick.js'
import type { DeferredPromise } from 'p-defer'
import type { TestSetup } from '../index.js'
import type { Stream } from '@libp2p/interfaces/connection'
import type { Muxer, MuxerOptions } from '@libp2p/interfaces/stream-muxer'
import type { Source, Duplex } from 'it-stream-types'

async function drainAndClose (stream: Duplex<Uint8Array>) {
  return await pipe([], stream, drain)
}

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  describe('base', () => {
    it('Open a stream from the dialer', async () => {
      const p = duplexPair<Uint8Array>()
      const dialer = await common.setup()
      const onStreamPromise: DeferredPromise<Stream> = defer()
      const onStreamEndPromise: DeferredPromise<Stream> = defer()

      const listener = await common.setup({
        onIncomingStream: (stream) => {
          onStreamPromise.resolve(stream)
        },
        onStreamEnd: (stream) => {
          onStreamEndPromise.resolve(stream)
        }
      })

      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const conn = dialer.newStream()
      expect(dialer.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)

      void drainAndClose(conn)

      const stream = await onStreamPromise.promise
      expect(isValidTick(stream.timeline.open)).to.equal(true)
      // Make sure the stream is being tracked
      expect(listener.streams).to.include(stream)

      void drainAndClose(stream)

      // Make sure stream is closed properly
      const endedStream = await onStreamEndPromise.promise
      expect(listener.streams).to.not.include(endedStream)

      if (endedStream.timeline.close == null) {
        throw new Error('timeline had no close time')
      }

      // Make sure the stream is removed from tracking
      expect(isValidTick(endedStream.timeline.close)).to.equal(true)

      await drainAndClose(dialer)
      await drainAndClose(listener)

      // ensure we have no streams left
      expect(dialer.streams).to.have.length(0)
      expect(listener.streams).to.have.length(0)
    })

    it('Open a stream from the listener', async () => {
      const p = duplexPair<Uint8Array>()
      const onStreamPromise: DeferredPromise<Stream> = defer()
      const dialer = await common.setup({
        onIncomingStream: (stream: Stream) => {
          onStreamPromise.resolve(stream)
        }
      })

      const listener = await common.setup()

      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const conn = listener.newStream()

      void drainAndClose(conn)

      const stream = await onStreamPromise.promise
      expect(isValidTick(stream.timeline.open)).to.equal(true)
      expect(listener.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)
      void drainAndClose(stream)

      await drainAndClose(dialer)
      await drainAndClose(listener)
    })

    it('Open a stream on both sides', async () => {
      const p = duplexPair<Uint8Array>()
      const onDialerStreamPromise: DeferredPromise<Stream> = defer()
      const onListenerStreamPromise: DeferredPromise<Stream> = defer()
      const dialer = await common.setup({
        onIncomingStream: (stream) => {
          onDialerStreamPromise.resolve(stream)
        }
      })

      const listener = await common.setup({
        onIncomingStream: (stream) => {
          onListenerStreamPromise.resolve(stream)
        }
      })

      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const dialerInitiatorStream = dialer.newStream()
      const listenerInitiatorStream = listener.newStream()

      await Promise.all([
        drainAndClose(dialerInitiatorStream),
        drainAndClose(listenerInitiatorStream),
        onDialerStreamPromise.promise.then(async stream => await drainAndClose(stream)),
        onListenerStreamPromise.promise.then(async stream => await drainAndClose(stream))
      ])

      await Promise.all([
        drainAndClose(dialer),
        drainAndClose(listener)
      ])
    })

    it('Open a stream on one side, write, open a stream on the other side', async () => {
      const toString = (source: Source<Uint8Array>) => map(source, (u) => uint8ArrayToString(u))
      const p = duplexPair<Uint8Array>()
      const onDialerStreamPromise: DeferredPromise<Stream> = defer()
      const onListenerStreamPromise: DeferredPromise<Stream> = defer()
      const dialer = await common.setup({
        onIncomingStream: (stream) => {
          onDialerStreamPromise.resolve(stream)
        }
      })
      const listener = await common.setup({
        onIncomingStream: (stream) => {
          onListenerStreamPromise.resolve(stream)
        }
      })

      void pipe(p[0], dialer, p[0])
      void pipe(p[1], listener, p[1])

      const dialerConn = dialer.newStream()
      const listenerConn = listener.newStream()

      void pipe([uint8ArrayFromString('hey')], dialerConn)
      void pipe([uint8ArrayFromString('hello')], listenerConn)

      const [
        dialerStream,
        listenerStream
      ] = await Promise.all([
        onDialerStreamPromise.promise,
        onListenerStreamPromise.promise
      ])

      const [
        listenerChunks,
        dialerChunks
      ] = await Promise.all([
        pipe(listenerStream, toString, async (source) => await all(source)),
        pipe(dialerStream, toString, async (source) => await all(source))
      ])

      expect(listenerChunks).to.be.eql(['hey'])
      expect(dialerChunks).to.be.eql(['hello'])
    })
  })
}

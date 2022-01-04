import { expect } from 'aegir/utils/chai.js'
// @ts-expect-error no types
import pair from 'it-pair/duplex.js'
import { pipe } from 'it-pipe'
import { collect, map, consume } from 'streaming-iterables'
import defer from 'p-defer'
import type { TestSetup } from '../index.js'
import type { Muxer, MuxerOptions, MuxedStream } from 'libp2p-interfaces/stream-muxer'
import { isValidTick } from '../transport/utils/index.js'

function close (stream: MuxedStream) {
  return pipe([], stream, consume)
}

export default (common: TestSetup<Muxer, MuxerOptions>) => {
  describe('base', () => {
    it('Open a stream from the dialer', async () => {
      const p = pair()
      const dialer = await common.setup()
      const onStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const onStreamEndPromise: defer.DeferredPromise<MuxedStream> = defer()

      const listener = await common.setup({
        onStream: stream => {
          onStreamPromise.resolve(stream)
        },
        onStreamEnd: stream => {
          onStreamEndPromise.resolve(stream)
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const conn = dialer.newStream()
      expect(dialer.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)

      const stream = await onStreamPromise.promise
      expect(isValidTick(stream.timeline.open)).to.equal(true)
      // Make sure the stream is being tracked
      expect(listener.streams).to.include(stream)
      close(stream)

      // Make sure stream is closed properly
      const endedStream = await onStreamEndPromise.promise
      expect(listener.streams).to.not.include(endedStream)

      if (endedStream.timeline.close == null) {
        throw new Error('timeline had no close time')
      }

      // Make sure the stream is removed from tracking
      expect(isValidTick(endedStream.timeline.close)).to.equal(true)

      await close(conn)

      // ensure we have no streams left
      expect(dialer.streams).to.have.length(0)
      expect(listener.streams).to.have.length(0)
    })

    it('Open a stream from the listener', async () => {
      const p = pair()
      const onStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const dialer = await common.setup({
        onStream: stream => {
          onStreamPromise.resolve(stream)
        }
      })

      const listener = await common.setup()

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const conn = listener.newStream()

      const stream = await onStreamPromise.promise
      expect(isValidTick(stream.timeline.open)).to.equal(true)
      expect(listener.streams).to.include(conn)
      expect(isValidTick(conn.timeline.open)).to.equal(true)
      await close(stream)

      await close(conn)
    })

    it('Open a stream on both sides', async () => {
      const p = pair()
      const onDialerStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const onListenerStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const dialer = await common.setup({
        onStream: stream => {
          onDialerStreamPromise.resolve(stream)
        }
      })
      const listener = await common.setup({
        onStream: stream => {
          onListenerStreamPromise.resolve(stream)
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const listenerConn = listener.newStream()
      const dialerConn = dialer.newStream()

      const dialerStream = await onDialerStreamPromise.promise
      const listenerStream = await onListenerStreamPromise.promise

      await close(dialerStream)
      await close(listenerStream)

      await close(dialerConn)
      await close(listenerConn)
    })

    it('Open a stream on one side, write, open a stream on the other side', async () => {
      const toString = map((c: string) => c.slice().toString())
      const p = pair()
      const onDialerStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const onListenerStreamPromise: defer.DeferredPromise<MuxedStream> = defer()
      const dialer = await common.setup({
        onStream: stream => {
          onDialerStreamPromise.resolve(stream)
        }
      })
      const listener = await common.setup({
        onStream: stream => {
          onListenerStreamPromise.resolve(stream)
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      const dialerConn = dialer.newStream()
      const listenerConn = listener.newStream()

      pipe(['hey'], dialerConn)
      pipe(['hello'], listenerConn)

      const listenerStream = await onListenerStreamPromise.promise
      const dialerStream = await onDialerStreamPromise.promise

      const listenerChunks = await pipe(listenerStream, toString, collect)
      expect(listenerChunks).to.be.eql(['hey'])

      const dialerChunks = await pipe(dialerStream, toString, collect)
      expect(dialerChunks).to.be.eql(['hello'])
    })
  })
}

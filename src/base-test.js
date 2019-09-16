/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('chai-checkmark'))
const { expect } = chai
const pair = require('it-pair/duplex')
const pipe = require('it-pipe')
const { collect, map, consume } = require('streaming-iterables')

async function closeAndWait (stream) {
  await pipe([], stream, consume)
  expect(true).to.be.true.mark()
}

module.exports = (common) => {
  describe('base', () => {
    let Muxer

    beforeEach(async () => {
      Muxer = await common.setup()
    })

    it('Open a stream from the dialer', (done) => {
      const p = pair()
      const dialer = new Muxer()

      const listener = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(3).checks(done)

      const conn = dialer.newStream()

      closeAndWait(conn)
    })

    it('Open a stream from the listener', (done) => {
      const p = pair()
      const dialer = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })
      const listener = new Muxer()

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(3).check(done)

      const conn = listener.newStream()

      closeAndWait(conn)
    })

    it('Open a stream on both sides', (done) => {
      const p = pair()
      const dialer = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })
      const listener = new Muxer(stream => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(6).check(done)

      const listenerConn = listener.newStream()
      const dialerConn = dialer.newStream()

      closeAndWait(dialerConn)
      closeAndWait(listenerConn)
    })

    it('Open a stream on one side, write, open a stream on the other side', (done) => {
      const toString = map(c => c.slice().toString())
      const p = pair()
      const dialer = new Muxer()
      const listener = new Muxer(stream => {
        pipe(stream, toString, collect).then(chunks => {
          expect(chunks).to.be.eql(['hey']).mark()
        })

        dialer.onStream = onDialerStream

        const listenerConn = listener.newStream()

        pipe(['hello'], listenerConn)

        async function onDialerStream (stream) {
          const chunks = await pipe(stream, toString, collect)
          expect(chunks).to.be.eql(['hello']).mark()
        }
      })

      pipe(p[0], dialer, p[0])
      pipe(p[1], listener, p[1])

      expect(2).check(done)

      const dialerConn = dialer.newStream()

      pipe(['hey'], dialerConn)
    })
  })
}

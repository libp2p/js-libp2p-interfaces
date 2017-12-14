/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('chai-checkmark'))
const expect = chai.expect
const pair = require('pull-pair/duplex')
const pull = require('pull-stream')

function closeAndWait (stream) {
  pull(
    pull.empty(),
    stream,
    pull.onEnd((err) => {
      expect(err).to.not.exist.mark()
    })
  )
}

module.exports = (common) => {
  describe('base', () => {
    let muxer

    beforeEach((done) => {
      common.setup((err, _muxer) => {
        if (err) return done(err)
        muxer = _muxer
        done()
      })
    })

    it('Open a stream from the dialer', (done) => {
      const p = pair()
      const dialer = muxer.dialer(p[0])
      const listener = muxer.listener(p[1])

      expect(4).checks(done)

      listener.on('stream', (stream) => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      const conn = dialer.newStream((err) => {
        expect(err).to.not.exist.mark()
      })

      closeAndWait(conn)
    })

    it('Open a stream from the listener', (done) => {
      const p = pair()
      const dialer = muxer.dialer(p[0])
      const listener = muxer.listener(p[1])

      expect(4).check(done)

      dialer.on('stream', (stream) => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      const conn = listener.newStream((err) => {
        expect(err).to.not.exist.mark()
      })

      closeAndWait(conn)
    })

    it('Open a stream on both sides', (done) => {
      const p = pair()
      const dialer = muxer.dialer(p[0])
      const listener = muxer.listener(p[1])

      expect(8).check(done)

      dialer.on('stream', (stream) => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      const listenerConn = listener.newStream((err) => {
        expect(err).to.not.exist.mark()
      })

      listener.on('stream', (stream) => {
        expect(stream).to.exist.mark()
        closeAndWait(stream)
      })

      const dialerConn = dialer.newStream((err) => {
        expect(err).to.not.exist.mark()
      })

      closeAndWait(dialerConn)
      closeAndWait(listenerConn)
    })

    it('Open a stream on one side, write, open a stream in the other side', (done) => {
      const p = pair()
      const dialer = muxer.dialer(p[0])
      const listener = muxer.listener(p[1])

      expect(6).check(done)

      const dialerConn = dialer.newStream((err) => {
        expect(err).to.not.exist.mark()
      })

      listener.on('stream', (stream) => {
        pull(
          stream,
          pull.collect((err, chunks) => {
            expect(err).to.not.exist.mark()
            expect(chunks).to.be.eql([Buffer.from('hey')]).mark()
          })
        )

        dialer.on('stream', onDialerStream)

        const listenerConn = listener.newStream((err) => {
          expect(err).to.not.exist.mark()
        })

        pull(
          pull.values(['hello']),
          listenerConn
        )

        function onDialerStream (stream) {
          pull(
            stream,
            pull.collect((err, chunks) => {
              expect(err).to.not.exist.mark()
              expect(chunks).to.be.eql([Buffer.from('hello')]).mark()
            })
          )
        }
      })

      pull(
        pull.values(['hey']),
        dialerConn
      )
    })
  })
}

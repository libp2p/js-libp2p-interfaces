/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
chai.use(require('chai-checkmark'))
const expect = chai.expect
const pair = require('pull-pair/duplex')
const pull = require('pull-stream')
const parallel = require('async/parallel')
const series = require('async/series')
const Tcp = require('libp2p-tcp')
const multiaddr = require('multiaddr')

const mh = multiaddr('/ip4/127.0.0.1/tcp/10000')

function closeAndWait (stream, callback) {
  pull(
    pull.empty(),
    stream,
    pull.onEnd(callback)
  )
}

module.exports = (common) => {
  describe('close', () => {
    let muxer

    beforeEach((done) => {
      common.setup((err, _muxer) => {
        if (err) return done(err)
        muxer = _muxer
        done()
      })
    })

    it('closing underlying socket closes streams (tcp)', (done) => {
      const tcp = new Tcp()
      const tcpListener = tcp.createListener((conn) => {
        const listener = muxer.listener(conn)
        listener.on('stream', (stream) => {
          pull(stream, stream)
        })
      })

      // Wait for the streams to open
      expect(2).checks(() => {
        // Once everything is closed, we're done
        expect(3).checks(done)
        tcpListener.close((err) => {
          expect(err).to.not.exist.mark()
        })
      })

      tcpListener.listen(mh, () => {
        const dialerConn = tcp.dial(mh, () => {
          const dialerMuxer = muxer.dialer(dialerConn)
          const s1 = dialerMuxer.newStream((err) => {
            expect(err).to.not.exist.mark()
            pull(
              s1,
              pull.onEnd((err) => {
                expect(err).to.exist.mark()
              })
            )
          })

          const s2 = dialerMuxer.newStream((err) => {
            expect(err).to.not.exist.mark()
            pull(
              s2,
              pull.onEnd((err) => {
                expect(err).to.exist.mark()
              })
            )
          })
        })
      })
    })

    it('closing one of the muxed streams doesn\'t close others', (done) => {
      const p = pair()
      const dialer = muxer.dialer(p[0])
      const listener = muxer.listener(p[1])

      expect(6).checks(done)

      const conns = []

      listener.on('stream', (stream) => {
        expect(stream).to.exist.mark()
        pull(stream, stream)
      })

      for (let i = 0; i < 5; i++) {
        conns.push(dialer.newStream())
      }

      conns.forEach((conn, i) => {
        if (i === 1) {
          closeAndWait(conn, (err) => {
            expect(err).to.not.exist.mark()
          })
        } else {
          pull(
            conn,
            pull.onEnd(() => {
              throw new Error('should not end')
            })
          )
        }
      })
    })

    it.skip('closing on spdy doesn\'t close until all the streams that are being muxed are closed', (done) => {
      const p = pair()
      const dialer = muxer.dial(p[0])
      const listener = muxer.listen(p[1])

      expect(15).checks(done)

      const conns = []
      const count = []
      for (let i = 0; i < 5; i++) {
        count.push(i)
      }

      series(count.map((i) => (cb) => {
        parallel([
          (cb) => listener.once('stream', (stream) => {
            expect(stream).to.exist.mark()
            pull(stream, stream)
            cb()
          }),
          (cb) => conns.push(dialer.newStream(cb))
        ], cb)
      }), (err) => {
        if (err) return done(err)

        conns.forEach((conn, i) => {
          pull(
            pull.values([Buffer.from('hello')]),
            pull.asyncMap((val, cb) => {
              setTimeout(() => {
                cb(null, val)
              }, i * 10)
            }),
            conn,
            pull.collect((err, data) => {
              expect(err).to.not.exist.mark()
              expect(data).to.be.eql([Buffer.from('hello')]).mark()
            })
          )
        })
      })
    })
  })
}

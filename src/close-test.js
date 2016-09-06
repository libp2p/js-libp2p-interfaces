/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('chai-checkmark'))
const expect = chai.expect
const pair = require('pull-pair/duplex')
const pull = require('pull-stream')
const parallel = require('run-parallel')
const series = require('run-series')
const Tcp = require('libp2p-tcp')
const multiaddr = require('multiaddr')

const mh = multiaddr('/ip4/127.0.0.1/tcp/9090')

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
  describe.only('close', () => {
    let muxer

    beforeEach((done) => {
      common.setup((err, _muxer) => {
        if (err) return done(err)
        muxer = _muxer
        done()
      })
    })

    it('closing underlying closes streams (tcp)', (done) => {
      expect(2).checks(done)

      const tcp = new Tcp()
      const tcpListener = tcp.createListener((socket) => {
        const listener = muxer.listen(socket)
        listener.on('stream', (stream) => {
          pull(stream, stream)
        })
      })

      tcpListener.listen(mh, () => {
        const dialer = muxer.dial(tcp.dial(mh, () => {
          tcpListener.close()
        }))

        const s1 = dialer.newStream(() => {
          pull(
            s1,
            pull.onEnd((err) => {
              expect(err).to.exist.mark()
            })
          )

          const s2 = dialer.newStream(() => {
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
      const dialer = muxer.dial(p[0])
      const listener = muxer.listen(p[1])

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
        if (i === 2) {
          closeAndWait(conn)
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
            console.log('pipe')
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
            pull.values([Buffer('hello')]),
            pull.asyncMap((val, cb) => {
              setTimeout(() => {
                cb(null, val)
              }, i * 10)
            }),
            pull.through((val) => console.log('send', val)),
            conn,
            pull.through((val) => console.log('recv', val)),
            pull.collect((err, data) => {
              console.log('end', i)
              expect(err).to.not.exist.mark()
              expect(data).to.be.eql([Buffer('hello')]).mark()
            })
          )
        })

        listener.on('close', () => {
          console.log('closed listener')
        })

        dialer.end(() => {
          console.log('CLOSED')
        })
      })
    })
  })
}

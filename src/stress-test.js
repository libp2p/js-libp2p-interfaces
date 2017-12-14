/* eslint-env mocha */
'use strict'

const spawn = require('./spawner')

module.exports = (common) => {
  describe('stress test', () => {
    let muxer

    beforeEach((done) => {
      common.setup((err, _muxer) => {
        if (err) return done(err)
        muxer = _muxer
        done()
      })
    })

    it('1 stream with 1 msg', (done) => {
      spawn(muxer, 1, 1, done)
    })

    it('1 stream with 10 msg', (done) => {
      spawn(muxer, 1, 10, done)
    })

    it('1 stream with 100 msg', (done) => {
      spawn(muxer, 1, 100, done)
    })

    it('10 streams with 1 msg', (done) => {
      spawn(muxer, 10, 1, done)
    })

    it('10 streams with 10 msg', (done) => {
      spawn(muxer, 10, 10, done)
    })

    it('10 streams with 100 msg', (done) => {
      spawn(muxer, 10, 100, done)
    })

    it('100 streams with 1 msg', (done) => {
      spawn(muxer, 100, 1, done)
    })

    it('100 streams with 10 msg', (done) => {
      spawn(muxer, 100, 10, done)
    })

    it('100 streams with 100 msg', (done) => {
      spawn(muxer, 100, 100, done)
    })

    it('1000 streams with 1 msg', (done) => {
      spawn(muxer, 1000, 1, done)
    })

    it('1000 streams with 10 msg', (done) => {
      spawn(muxer, 1000, 10, done)
    })

    it('1000 streams with 100 msg', function (done) {
      this.timeout(80 * 1000)
      spawn(muxer, 1000, 100, done)
    })
  })
}

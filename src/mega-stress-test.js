/* eslint-env mocha */
'use strict'

const spawn = require('./spawner')

module.exports = (common) => {
  describe.skip('mega stress test', function () {
    this.timeout(100 * 200 * 1000)
    let muxer

    beforeEach((done) => {
      common.setup((err, _muxer) => {
        if (err) return done(err)
        muxer = _muxer
        done()
      })
    })

    it('10000 messages of 10000 streams', (done) => {
      spawn(muxer, 10000, 10000, done, 5000)
    })
  })
}

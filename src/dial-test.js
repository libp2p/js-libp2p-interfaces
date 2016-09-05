/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pull = require('pull-stream')
const goodbye = require('pull-goodbye')

module.exports = (common) => {
  describe('dial', () => {
    let addrs
    let transport
    let listener

    before((done) => {
      common.setup((err, _transport, _addrs) => {
        if (err) return done(err)
        transport = _transport
        addrs = _addrs
        done()
      })
    })

    after((done) => {
      common.teardown(done)
    })

    beforeEach((done) => {
      listener = transport.createListener((conn) => {
        pull(
          conn,
          pull.map((x) => {
            if (x.toString() !== 'GOODBYE') {
              return new Buffer(x.toString() + '!')
            }
            return x
          }),
          conn
        )
      })
      listener.listen(addrs[0], done)
    })

    afterEach((done) => {
      listener.close(done)
    })

    it('simple', (done) => {
      const s = goodbye({
        source: pull.values([new Buffer('hey')]),
        sink: pull.collect((err, values) => {
          expect(err).to.not.exist
          expect(
            values
          ).to.be.eql(
            [new Buffer('hey!')]
          )
          done()
        })
      })

      pull(s, transport.dial(addrs[0]), s)
    })

    it('to non existent listener', (done) => {
      pull(
        transport.dial(addrs[1]),
        pull.onEnd((err) => {
          expect(err).to.exist
          done()
        })
      )
    })
  })
}

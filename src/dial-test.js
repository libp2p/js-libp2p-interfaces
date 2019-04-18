/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const goodbye = require('it-goodbye')
const { collect } = require('streaming-iterables')
const pipe = require('it-pipe')
const AbortController = require('abort-controller')
const AbortError = require('./errors').AbortError

module.exports = (common) => {
  describe('dial', () => {
    let addrs
    let transport
    let connector
    let listener

    before(async () => {
      ({ addrs, transport, connector } = await common.setup())
    })

    after(() => common.teardown && common.teardown())

    beforeEach(() => {
      listener = transport.createListener((conn) => pipe(conn, conn))
      return listener.listen(addrs[0])
    })

    afterEach(() => listener.close())

    it('simple', async () => {
      const conn = await transport.dial(addrs[0])

      const s = goodbye({ source: ['hey'], sink: collect })

      const result = await pipe(s, conn, s)

      expect(result.length).to.equal(1)
      expect(result[0].toString()).to.equal('hey')
    })

    it('to non existent listener', async () => {
      try {
        await transport.dial(addrs[1])
      } catch (_) {
        // Success: expected an error to be throw
        return
      }
      expect.fail('Did not throw error attempting to connect to non-existent listener')
    })

    it('cancel before dialing', async () => {
      const controller = new AbortController()
      controller.abort()
      const socket = transport.dial(addrs[0], { signal: controller.signal })

      try {
        await socket
      } catch (err) {
        expect(err.code).to.eql(AbortError.code)
        expect(err.type).to.eql(AbortError.type)
        return
      }
      expect.fail('Did not throw error with code ' + AbortError.code)
    })

    it('cancel while dialing', async () => {
      // Add a delay to connect() so that we can cancel while the dial is in
      // progress
      connector.delay(100)

      const controller = new AbortController()
      const socket = transport.dial(addrs[0], { signal: controller.signal })
      setTimeout(() => controller.abort(), 50)

      try {
        await socket
      } catch (err) {
        expect(err.code).to.eql(AbortError.code)
        expect(err.type).to.eql(AbortError.type)
        return
      } finally {
        connector.restore()
      }
      expect.fail('Did not throw error with code ' + AbortError.code)
    })
  })
}

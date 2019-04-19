/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')

module.exports = (common) => {
  describe('listen', () => {
    let addrs
    let transport

    before(async () => {
      ({ transport, addrs } = await common.setup())
    })

    after(() => common.teardown && common.teardown())

    it('simple', async () => {
      const listener = transport.createListener((conn) => {})
      await listener.listen([addrs[0]])
      await listener.close()
    })

    it('listen on multiple addresses', async () => {
      // create an echo listener
      const listener = transport.createListener((conn) => pipe(conn, conn))
      await listener.listen(addrs.slice(0, 2))

      // Connect on both addresses
      const [socket1, socket2] = await Promise.all([
        transport.dial(addrs[0]),
        transport.dial(addrs[1])
      ])

      const data = Buffer.from('hi there')
      const results = await pipe(
        [data], // [data] -> socket1
        socket1, // socket1 -> server (echo) -> socket1 -> socket2
        socket2, // socket2 -> server (echo) -> socket2 -> collect
        collect
      )

      expect(results).to.eql([data])

      await listener.close()
    })

    it('close listener with connections, through timeout', async () => {
      let finish
      let done = new Promise((resolve) => {
        finish = resolve
      })

      const listener = transport.createListener((conn) => pipe(conn, conn))

      // Listen
      await listener.listen([addrs[0]])

      // Create two connections to the listener
      const socket1 = await transport.dial(addrs[0])
      await transport.dial(addrs[0])

      pipe(
        [Buffer.from('Some data that is never handled')],
        socket1
      ).then(() => {
        finish()
      })

      // Closer the listener (will take a couple of seconds to time out)
      await listener.close()

      // Pipe should have completed
      await done
    })

    describe('events', () => {
      it('connection', (done) => {
        const listener = transport.createListener()

        listener.on('connection', async (conn) => {
          expect(conn).to.exist()
          await listener.close()
          done()
        })

        ;(async () => {
          await listener.listen([addrs[0]])
          await transport.dial(addrs[0])
        })()
      })

      it('listening', (done) => {
        const listener = transport.createListener()
        listener.on('listening', async () => {
          await listener.close()
          done()
        })
        listener.listen(addrs[0])
      })

      it('error', (done) => {
        const listener = transport.createListener()
        listener.on('error', async (err) => {
          expect(err).to.exist()
          await listener.close()
          done()
        })
        listener.emit('error', new Error('my err'))
      })

      it('close', (done) => {
        const listener = transport.createListener()
        listener.on('close', done)

        ;(async () => {
          await listener.listen([addrs[0]])
          await listener.close()
        })()
      })
    })
  })
}

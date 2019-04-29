/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const pipe = require('it-pipe')

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
      await listener.listen(addrs[0])
      await listener.close()
    })

    it('close listener with connections, through timeout', async () => {
      let finish
      let done = new Promise((resolve) => {
        finish = resolve
      })

      const listener = transport.createListener((conn) => pipe(conn, conn))

      // Listen
      await listener.listen(addrs[0])

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
          await listener.listen(addrs[0])
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
          await listener.listen(addrs[0])
          await listener.close()
        })()
      })
    })
  })
}

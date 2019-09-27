/* eslint-env mocha */

'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

module.exports = (test) => {
  describe('connection', () => {
    describe('open connection', () => {
      let connection

      beforeEach(async () => {
        connection = await test.setup()
        if (!connection) throw new Error('missing connection')
      })

      afterEach(async () => {
        await connection.close()
        await test.teardown()
      })

      it('should have properties set', () => {
        expect(connection.id).to.exist()
        expect(connection.localPeer).to.exist()
        expect(connection.remotePeer).to.exist()
        expect(connection.localAddr).to.exist()
        expect(connection.remoteAddr).to.exist()
        expect(connection.stat.status).to.equal('open')
        expect(connection.stat.timeline.open).to.exist()
        expect(connection.stat.timeline.upgraded).to.exist()
        expect(connection.stat.timeline.close).to.not.exist()
        expect(connection.stat.direction).to.exist()
        expect(connection.streams).to.eql([])
        expect(connection.tags).to.eql([])
      })

      it('should get the metadata of an open connection', () => {
        const stat = connection.stat

        expect(stat.status).to.equal('open')
        expect(stat.direction).to.exist()
        expect(stat.timeline.open).to.exist()
        expect(stat.timeline.upgraded).to.exist()
        expect(stat.timeline.close).to.not.exist()
      })

      it('should return an empty array of streams', () => {
        const streams = connection.streams

        expect(streams).to.eql([])
      })

      it('should be able to create a new stream', async () => {
        const protocolToUse = '/echo/0.0.1'
        const { stream, protocol } = await connection.newStream(protocolToUse)

        expect(protocol).to.equal(protocolToUse)

        const connStreams = await connection.streams

        expect(stream).to.exist()
        expect(connStreams).to.exist()
        expect(connStreams).to.have.lengthOf(1)
        expect(connStreams[0]).to.equal(stream)
      })
    })

    describe('close connection', () => {
      let connection

      beforeEach(async () => {
        connection = await test.setup()
        if (!connection) throw new Error('missing connection')
      })

      afterEach(async () => {
        await test.teardown()
      })

      it('should be able to close the connection after being created', async () => {
        expect(connection.stat.timeline.close).to.not.exist()
        await connection.close()

        expect(connection.stat.timeline.close).to.exist()
        expect(connection.stat.status).to.equal('closed')
      })

      it('should be able to close the connection after opening a stream', async () => {
        // Open stream
        const protocol = '/echo/0.0.1'
        await connection.newStream(protocol)

        // Close connection
        expect(connection.stat.timeline.close).to.not.exist()
        await connection.close()

        expect(connection.stat.timeline.close).to.exist()
        expect(connection.stat.status).to.equal('closed')
      })

      it('should fail to create a new stream if the connection is closing', async () => {
        expect(connection.stat.timeline.close).to.not.exist()
        connection.close()

        try {
          const protocol = '/echo/0.0.1'
          await connection.newStream(protocol)
        } catch (err) {
          expect(err).to.exist()
          return
        }

        throw new Error('should fail to create a new stream if the connection is closing')
      })

      it('should fail to create a new stream if the connection is closed', async () => {
        expect(connection.stat.timeline.close).to.not.exist()
        await connection.close()

        try {
          const protocol = '/echo/0.0.1'
          await connection.newStream(protocol)
        } catch (err) {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_CONNECTION_CLOSED')
          return
        }

        throw new Error('should fail to create a new stream if the connection is closing')
      })
    })
  })
}

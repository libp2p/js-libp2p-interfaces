import tests from '@libp2p/interface-connection-compliance-tests'
import { connectionPair } from '../src/connection.js'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { mockRegistrar } from '../src/registrar.js'
import type { Connection } from '@libp2p/interface-connection'
import { pipe } from 'it-pipe'

describe('mock connection compliance tests', () => {
  let connections: Connection[] = []

  tests({
    async setup () {
      const componentsA = {
        peerId: await createEd25519PeerId(),
        registrar: mockRegistrar()
      }
      const componentsB = {
        peerId: await createEd25519PeerId(),
        registrar: mockRegistrar()
      }
      connections = connectionPair(componentsA, componentsB)

      await componentsB.registrar.handle('/echo/0.0.1', (data) => {
        void pipe(
          data.stream,
          data.stream
        )
      })

      return connections[0]
    },
    async teardown () {
      await Promise.all(connections.map(async conn => {
        await conn.close()
      }))
    }
  })
})

import connectionSuite from './connection.js'
import type { TestSetup } from '@libp2p/interface-compliance-tests'
import type { Connection } from '@libp2p/interface-connection'

export default (test: TestSetup<Connection>) => {
  connectionSuite(test)
}

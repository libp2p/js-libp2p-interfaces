import connectionSuite from './connection.js'
import type { TestSetup } from '../index.js'
import type { Connection } from '@libp2p/interfaces/connection'

export default (test: TestSetup<Connection>) => {
  connectionSuite(test)
}

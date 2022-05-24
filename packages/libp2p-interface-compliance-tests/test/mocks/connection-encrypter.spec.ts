import tests from '../../src/connection-encrypter/index.js'
import { mockConnectionEncrypter } from '../../src/mocks/connection-encrypter.js'

describe('compliance tests', () => {
  tests({
    async setup () {
      return mockConnectionEncrypter()
    },
    async teardown () {

    }
  })
})

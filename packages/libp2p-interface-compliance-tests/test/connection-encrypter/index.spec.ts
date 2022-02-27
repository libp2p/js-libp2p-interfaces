import tests from '../../src/connection-encrypter/index.js'
import mockCrypto from './mock-crypto.js'

describe('compliance tests', () => {
  tests({
    async setup () {
      return mockCrypto
    },
    async teardown () {}
  })
})

/* eslint-env mocha */
'use strict'

const tests = require('../../src/crypto/tests')
const mockCrypto = require('./mock-crypto')

describe('compliance tests', () => {
  tests({
    setup () {
      return mockCrypto
    }
  })
})

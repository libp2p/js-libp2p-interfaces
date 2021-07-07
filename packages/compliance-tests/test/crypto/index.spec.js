/* eslint-env mocha */
'use strict'

const tests = require('../../src/crypto')
const mockCrypto = require('./mock-crypto')

describe('compliance tests', () => {
  tests({
    setup () {
      return mockCrypto
    }
  })
})

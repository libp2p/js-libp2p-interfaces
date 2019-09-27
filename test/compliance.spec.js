/* eslint-env mocha */
'use strict'

const tests = require('../src')
const MockDiscovery = require('./mock-discovery')

describe('compliance tests', () => {
  tests({
    setup () {
      return new MockDiscovery()
    }
  })
})

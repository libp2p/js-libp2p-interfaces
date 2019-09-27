/* eslint-env mocha */
'use strict'

const tests = require('../src')
const MockDiscovery = require('./mock-discovery')

describe('compliance tests', () => {
  tests({
    async setup () {
      await new Promise(resolve => setTimeout(resolve, 10))
      return new MockDiscovery()
    },
    async teardown () {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  })
})

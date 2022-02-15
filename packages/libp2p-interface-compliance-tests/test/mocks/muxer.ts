import tests from '../../src/stream-muxer/index.js'
import { mockMuxer } from '../../src/mocks/muxer.js'

describe('compliance tests', () => {
  tests({
    async setup (options) {
      return mockMuxer(options)
    },
    async teardown () {

    }
  })
})

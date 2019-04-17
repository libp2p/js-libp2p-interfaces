'use strict'

class AbortError extends Error {
  constructor () {
    super('AbortError')
    this.code = AbortError.code
  }

  static get code () {
    return 'ABORT_ERR'
  }
}

module.exports = {
  AbortError
}

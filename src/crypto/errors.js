'use strict'

class UnexpectedPeerError extends Error {
  constructor (message = 'Unexpected Peer') {
    super(message)
    this.code = UnexpectedPeerError.code
  }

  static get code () {
    return 'ERR_UNEXPECTED_PEER'
  }
}

module.exports = {
  UnexpectedPeerError
}

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

class InvalidCryptoExchangeError extends Error {
  constructor (message = 'Invalid crypto exchange') {
    super(message)
    this.code = InvalidCryptoExchangeError.code
  }

  static get code () {
    return 'ERR_INVALID_CRYPTO_EXCHANGE'
  }
}

module.exports = {
  UnexpectedPeerError,
  InvalidCryptoExchangeError
}

'use strict'

const errcode = require('err-code')

/**
 * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
 */
class Record {
  /**
   * @class
   * @param {string} domain - signature domain
   * @param {Uint8Array} codec - identifier of the type of record
   */
  constructor (domain, codec) {
    this.domain = domain
    this.codec = codec
  }

  // eslint-disable-next-line
  /**
   * Marshal a record to be used in an envelope.
   *
   * @returns {Uint8Array}
   */
  marshal () {
    throw errcode(new Error('marshal must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }

  // eslint-disable-next-line
  /**
   * Verifies if the other provided Record is identical to this one.
   *
   * @param {Record} other
   * @returns {boolean}
   */
  equals (other) {
    throw errcode(new Error('equals must be implemented by the subclass'), 'ERR_NOT_IMPLEMENTED')
  }
}

module.exports = Record

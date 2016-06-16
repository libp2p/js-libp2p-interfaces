'use strict'

const util = require('util')
const Duplexify = require('duplexify')

module.exports = Connection

util.inherits(Connection, Duplexify)

function Connection (conn) {
  if (!(this instanceof Connection)) {
    return new Connection(conn)
  }

  Duplexify.call(this)

  let peerInfo

  this.getPeerInfo = (callback) => {
    if (conn.getPeerInfo) {
      return conn.getPeerInfo(callback)
    }

    if (!peerInfo) {
      return callback(new Error('Peer Info not set yet'))
    }

    callback(null, peerInfo)
  }

  this.setPeerInfo = (_peerInfo) => {
    if (conn.setPeerInfo) {
      return conn.setPeerInfo(_peerInfo)
    }
    peerInfo = _peerInfo
  }

  this.getObservedAddrs = (callback) => {
    if (conn.getObservedAddrs) {
      return conn.getObservedAddrs(callback)
    }
    callback(null, [])
  }

  this.setInnerConn = (conn) => {
    this.setReadable(conn)
    this.setWritable(conn)
  }

  if (conn) {
    this.setInnerConn(conn)
  }
}

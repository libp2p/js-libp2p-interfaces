'use strict'

const errCode = require('err-code')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')

function validateArgs (localAddr, localPeer, remotePeer, newStream, close, getStreams, stat) {
  if (localAddr && !multiaddr.isMultiaddr(localAddr)) {
    throw errCode(new Error('localAddr must be an instance of multiaddr'), 'ERR_INVALID_PARAMETERS')
  }

  if (!PeerId.isPeerId(localPeer)) {
    throw errCode(new Error('localPeer must be an instance of peer-id'), 'ERR_INVALID_PARAMETERS')
  }

  if (!PeerId.isPeerId(remotePeer)) {
    throw errCode(new Error('remotePeer must be an instance of peer-id'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof newStream !== 'function') {
    throw errCode(new Error('new stream must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof close !== 'function') {
    throw errCode(new Error('close must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (typeof getStreams !== 'function') {
    throw errCode(new Error('getStreams must be a function'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat) {
    throw errCode(new Error('connection metadata object must be provided'), 'ERR_INVALID_PARAMETERS')
  }

  if (stat.direction !== 'inbound' && stat.direction !== 'outbound') {
    throw errCode(new Error('direction must be "inbound" or "outbound"'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline) {
    throw errCode(new Error('connection timeline object must be provided in the stat object'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline.open) {
    throw errCode(new Error('connection open timestamp must be provided'), 'ERR_INVALID_PARAMETERS')
  }

  if (!stat.timeline.upgraded) {
    throw errCode(new Error('connection upgraded timestamp must be provided'), 'ERR_INVALID_PARAMETERS')
  }
}

module.exports = {
  validateArgs
}

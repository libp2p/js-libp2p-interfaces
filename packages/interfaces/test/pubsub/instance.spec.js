/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')

const PubsubBaseImpl = require('../../src/pubsub')
const {
  createPeerId,
  mockRegistrar
} = require('./utils')

describe('pubsub instance', () => {
  let peerId

  before(async () => {
    peerId = await createPeerId()
  })

  it('should throw if no debugName is provided', () => {
    expect(() => {
      new PubsubBaseImpl() // eslint-disable-line no-new
    }).to.throw()
  })

  it('should throw if no multicodec is provided', () => {
    expect(() => {
      new PubsubBaseImpl({ // eslint-disable-line no-new
        debugName: 'pubsub'
      })
    }).to.throw()
  })

  it('should throw if no libp2p is provided', () => {
    expect(() => {
      new PubsubBaseImpl({ // eslint-disable-line no-new
        debugName: 'pubsub',
        multicodecs: '/pubsub/1.0.0'
      })
    }).to.throw()
  })

  it('should accept valid parameters', () => {
    expect(() => {
      new PubsubBaseImpl({ // eslint-disable-line no-new
        debugName: 'pubsub',
        multicodecs: '/pubsub/1.0.0',
        libp2p: {
          peerId: peerId,
          registrar: mockRegistrar
        }
      })
    }).not.to.throw()
  })
})

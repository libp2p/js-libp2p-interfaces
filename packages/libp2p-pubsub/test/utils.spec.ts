import { expect } from 'aegir/utils/chai.js'
import * as utils from '../src/utils.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import type { Message, RPCMessage } from '@libp2p/interfaces/src/pubsub'
import { peerIdFromBytes, peerIdFromString } from '@libp2p/peer-id'

describe('utils', () => {
  it('randomSeqno', () => {
    const first = utils.randomSeqno()
    const second = utils.randomSeqno()

    expect(first).to.be.a('BigInt')
    expect(second).to.be.a('BigInt')
    expect(first).to.not.equal(second)
  })

  it('msgId should not generate same ID for two different Uint8Arrays', () => {
    const peerId = peerIdFromString('QmPNdSYk5Rfpo5euNqwtyizzmKXMNHdXeLjTQhcN4yfX22')
    const msgId0 = utils.msgId(peerId.multihash.bytes, 1n)
    const msgId1 = utils.msgId(peerId.multihash.bytes, 2n)
    expect(msgId0).to.not.deep.equal(msgId1)
  })

  it('anyMatch', () => {
    [
      { a: [1, 2, 3], b: [4, 5, 6], result: false },
      { a: [1, 2], b: [1, 2], result: true },
      { a: [1, 2, 3], b: [4, 5, 1], result: true },
      { a: [5, 6, 1], b: [1, 2, 3], result: true },
      { a: [], b: [], result: false },
      { a: [1], b: [2], result: false }
    ].forEach((test) => {
      expect(utils.anyMatch(new Set(test.a), new Set(test.b))).to.equal(test.result)
      expect(utils.anyMatch(new Set(test.a), test.b)).to.equal(test.result)
    })
  })

  it('ensureArray', () => {
    expect(utils.ensureArray('hello')).to.be.eql(['hello'])
    expect(utils.ensureArray([1, 2])).to.be.eql([1, 2])
  })

  it('converts an OUT msg.from to binary', () => {
    const binaryId = uint8ArrayFromString('1220e2187eb3e6c4fb3e7ff9ad4658610624a6315e0240fc6f37130eedb661e939cc', 'base16')
    const stringId = 'QmdZEWgtaWAxBh93fELFT298La1rsZfhiC2pqwMVwy3jZM'
    const m: Message[] = [{
      from: peerIdFromBytes(binaryId),
      topic: '',
      data: new Uint8Array()
    }, {
      from: peerIdFromString(stringId),
      topic: '',
      data: new Uint8Array()
    }]
    const expected: RPCMessage[] = [{
      from: binaryId,
      topic: '',
      data: new Uint8Array(),
      seqno: undefined,
      signature: undefined,
      key: undefined
    }, {
      from: binaryId,
      topic: '',
      data: new Uint8Array(),
      seqno: undefined,
      signature: undefined,
      key: undefined
    }]
    for (let i = 0; i < m.length; i++) {
      expect(utils.toRpcMessage(m[i])).to.deep.equal(expected[i])
    }
  })
})

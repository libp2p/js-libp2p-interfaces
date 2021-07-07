// @ts-nocheck interface tests
'use strict'

const { expect } = require('aegir/utils/chai')

exports.first = (map) => map.values().next().value

exports.expectSet = (set, subs) => {
  expect(Array.from(set.values())).to.eql(subs)
}

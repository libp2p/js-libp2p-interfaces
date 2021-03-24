'use strict'

// @ts-ignore protons not typed
const protons = require('protons')

const rpcProto = protons(require('./rpc.proto.js'))
const RPC = rpcProto.RPC
const topicDescriptorProto = protons(require('./topic-descriptor.proto.js'))

module.exports = {
  rpc: rpcProto,
  td: topicDescriptorProto,
  RPC,
  Message: RPC.Message,
  SubOpts: RPC.SubOpts
}

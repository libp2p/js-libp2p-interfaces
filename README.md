abstract-record-store
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a a IPRS compliant(https://github.com/ipfs/specs/tree/master/records) Record Store. 

The primary goal of this module is to enable developers to pick and swap their Record Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by [`abstract-blob-store`](https://github.com/maxogden/abstract-blob-store) and [`abstract-stream-muxer`](https://github.com/diasdavid/abstract-stream-muxer).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

# Modules that implement the interface

- [ipfs-distributed-record-store](https://github.com/diasdavid/node-ipfs-distributed-record-store)
- [ipfs-kad-record-store](https://github.com/diasdavid/node-ipfs-kad-record-store)

# Badge

Include this badge in your readme if you make a module that is compatible with the abstract-record-store API. You can validate this by running the tests.



# How to use the battery of tests

## Node.js

## Go

> WIP

# API



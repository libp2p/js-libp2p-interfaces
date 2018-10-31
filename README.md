interface-record-store
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a a [IPRS compliant](/IPRS.md) Record Store. 

The primary goal of this module is to enable developers to pick and swap their Record Store module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by [`abstract-blob-store`](https://github.com/maxogden/abstract-blob-store) and [`interface-stream-muxer`](https://github.com/libp2p/interface-stream-muxer).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through diferent stacks.

## Lead Maintainer

[Vasco Santos](https://github.com/vasco-santos).

# Modules that implement the interface

- [ipfs-distributed-record-store](https://github.com/libp2p/js-libp2p-distributed-record-store)
- [ipfs-kad-record-store](https://github.com/libp2p/js-libp2p-kad-record-store)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-record-store API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/diasdavid/interface-record-store/master/img/badge.png)

# How to use the battery of tests

## Node.js

```
var tape = require('tape')
var tests = require('interface-record-store/tests')
var YourRecordStore = require('../src')

var common = {
  setup: function (t, cb) {
    cb(null, YourRecordStore)
  },
  teardown: function (t, cb) {
    cb()
  }
}

tests(tape, common)
```

## Go

> WIP

# API

A valid (read: that follows this abstraction) stream muxer, must implement the following API.

### Obtain a Record

- `Node.js` rs.get(key, function (err, records) {})

This method returns an array of records, found in the Record Store.

If `err` is passed, `records` will be a `undefined` value.

`key` is a multihash value that represents any arbitraty random value, that may have records associated with it.

### Store a Record

- `Node.js` rs.put(key, recordSignatureMultiHash, function (err) {})

`recordSignatureMultihash` is multihash of the Record Signature MerkleDAG obj, as described by IPRS - InterPlanetary Record Spec

if `err` is passed, means that the record wasn't stored properly or it was unvalid.

### Implementation considerations


- the key is a multihash but not necessarily the hash of the record signature object.
- a DRS instance must have a mapping of key->[hash(recordSignature)] to know which records belong to a given key (provided value)
- DRS implements the interface-record-store interface
- DRS may levarage other implementations of interface-record-store to find records in the network or other storage mechanisms
- DRS should return every valid record it can find in a query
- all unvalid records detected in the process should be discarded/deleted

interface-peer-routing
=====================

**WIP: This module is not yet implemented**

> A test suite and interface you can use to implement a Peer Routing module for libp2p.

The primary goal of this module is to enable developers to pick and swap their Peer Routing module as they see fit for their libp2p installation, without having to go through shims or compatibility issues. This module and test suite were heavily inspired by abstract-blob-store and interface-stream-muxer.

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

# Modules that implement the interface

- [JavaScript libp2p-kad-dht](https://github.com/libp2p/js-libp2p-kad-dht)
- [JavaScript libp2p-delegated-peer-routing](https://github.com/libp2p/js-libp2p-delegated-peer-routing)

# Badge

Include this badge in your readme if you make a module that is compatible with the interface-record-store API. You can validate this by running the tests.

![](https://raw.githubusercontent.com/libp2p/interface-peer-routing/master/img/badge.png)

# How to use the battery of tests

## Node.js

TBD

# API

A valid (read: that follows this abstraction) Peer Routing module must implement the following API.

### `.findPeers` - Find peers 'responsible' or 'closest' to a given key

- `Node.js` peerRouting.findPeers(key, function (err, peersPriorityQueue) {})

In a peer to peer context, the concept of 'responsability' or 'closeness' for a given key translates to having a way to find deterministically or that at least there is a significant overlap between searches, the same group of peers when searching for the same given key.

This method will query the network (route it) and return a Priority Queue datastructe with a list of PeerInfo objects, ordered by 'closeness'.

key is a multihash

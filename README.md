abstract-stream-muxer
=====================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement a stream muxer.

# Modules that implement the interface

- 

Send a PR to add a new one if you happen to find or write one.

# Badge

![](/img/badge.png)

# How to use


# API

A valid (read: that follows this abstraction) stream muxer, must implement the following API.

### `Node.js` muxer.attach(transport, function (err, conn)) || `Go` conn, err := muxer.attach(transport)


### `Node.js` conn.dialStream(function (err, stream)) || `Go` stream, err := conn.dialStream()


### `Node.js` conn.on('stream', function (stream)) || `Go` stream := conn.listen()

# interface-stream-muxer

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![Discourse posts](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![](https://img.shields.io/travis/libp2p/interface-stream-muxer.svg?style=flat-square)](https://travis-ci.com/libp2p/interface-stream-muxer)
[![Dependency Status](https://david-dm.org/libp2p/interface-stream-muxer.svg?style=flat-square)](https://david-dm.org/libp2p/interface-stream-muxer)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> A test suite and interface you can use to implement a stream muxer. "A one stop shop for all your muxing needs"

The primary goal of this module is to enable developers to pick and swap their stream muxing module as they see fit for their application, without having to go through shims or compatibility issues. This module and test suite was heavily inspired by [abstract-blob-store](https://github.com/maxogden/abstract-blob-store).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is no actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through different stacks.

## Lead Maintainer

[Jacob Heun](https://github.com/jacobheun/)

## Modules that implement the interface

- [JavaScript libp2p-spdy](https://github.com/libp2p/js-libp2p-spdy)
- [JavaScript libp2p-mplex](https://github.com/libp2p/js-libp2p-mplex)
- [Go spdy, muxado, yamux and multiplex](https://github.com/jbenet/go-stream-muxer)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-stream-muxer API.

![](/img/badge.png)

## Usage

### JS

Install `interface-stream-muxer` as one of the dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const test = require('interface-stream-muxer')

const common = {
  async setup () {
    return yourMuxer
  },
  async teardown () {
    // cleanup
  }
}

// use all of the test suits
test(common)
```

### Go

> WIP

## API

### JS

A valid (one that follows this abstraction) stream muxer, must implement the following API:

#### `const muxer = new Muxer([options])`

Create a new _duplex_ stream that can be piped together with a connection in order to allow multiplexed communications.

e.g.

```js
const Muxer = require('your-muxer-module')
const pipe = require('it-pipe')

// Create a duplex muxer
const muxer = new Muxer()

// Use the muxer in a pipeline
pipe(conn, muxer, conn) // conn is duplex connection to another peer
```

`options` is an optional `Object` that may have the following properties:

* `onStream` - A function called when receiving a new stream from the remote. e.g.
    ```js
    // Receive a new stream on the muxed connection
    const onStream = stream => {
      // Read from this stream and write back to it (echo server)
      pipe(
        stream,
        source => (async function * () {
          for await (const data of source) yield data
        })()
        stream
      )
    }
    const muxer = new Muxer({ onStream })
    // ...
    ```
    **Note:** The `onStream` function can be passed in place of the `options` object. i.e.
    ```js
    new Mplex(stream => { /* ... */ })
    ```
* `signal` - An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) which can be used to abort the muxer, _including_ all of it's multiplexed connections. e.g.
    ```js
    const controller = new AbortController()
    const muxer = new Muxer({ signal: controller.signal })

    pipe(conn, muxer, conn)

    controller.abort()
    ```
* `maxMsgSize` - The maximum size in bytes the data field of multiplexed messages may contain (default 1MB)

#### `muxer.onStream`

Use this property as an alternative to passing `onStream` as an option to the `Muxer` constructor.

```js
const muxer = new Muxer()
// ...later
muxer.onStream = stream => { /* ... */ }
```

#### `const stream = muxer.newStream([options])`

Initiate a new stream with the remote. Returns a [duplex stream](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it).

e.g.

```js
// Create a new stream on the muxed connection
const stream = muxer.newStream()

// Use this new stream like any other duplex stream:
pipe([1, 2, 3], stream, consume)
```

### Go

#### Attach muxer to a Connection

```go
muxedConn, err := muxer.Attach(conn, isListener)
```

This method attaches our stream muxer to an instance of [Connection](https://github.com/libp2p/interface-connection/blob/master/src/connection.js) defined by [interface-connection](https://github.com/libp2p/interface-connection).

If `err` is passed, no operation should be made in `conn`.

`isListener` is a bool that tells the side of the socket we are, `isListener = true` for listener/server and `isListener = false` for dialer/client side.

`muxedConn` interfaces our established Connection with the other endpoint, it must offer an interface to open a stream inside this connection and to receive incomming stream requests.

#### Dial(open/create) a new stream

```go
stream, err := muxedConn.newStream()
```

This method negotiates and opens a new stream with the other endpoint.

If `err` is passed, no operation should be made in `stream`.

`stream` interface our established Stream with the other endpoint, it must implement the [ReadWriteCloser](http://golang.org/pkg/io/#ReadWriteCloser).

#### Listen(wait/accept) a new incoming stream

```go
stream := muxedConn.Accept()
```

Each time a dialing peer initiates the new stream handshake, a new stream is created on the listening side.

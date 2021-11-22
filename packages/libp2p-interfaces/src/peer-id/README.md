interface-peer-id
========================

> A test suite and interface you can use to implement a PeerId module for libp2p.

The primary goal of this module is to enable developers to implement PeerId modules. This module and test suite was heavily inspired by earlier implementation of [PeerId](https://github.com/libp2p/js-peer-id).

Publishing a test suite as a module lets multiple modules all ensure compatibility since they use the same test suite.

The API is presented with both Node.js and Go primitives, however, there is not actual limitations for it to be extended for any other language, pushing forward the cross compatibility and interop through different stacks.

## Modules that implement the interface

- [JavaScript libp2p-peer-id](https://github.com/libp2p/js-peer-id)

Send a PR to add a new one if you happen to find or write one.

## Badge

Include this badge in your readme if you make a new module that uses interface-peer-id API.

![](/img/badge.png)

## Usage

### Node.js

Install `libp2p-interfaces-compliance-tests` as one of the development dependencies of your project and as a test file. Then, using `mocha` (for JavaScript) or a test runner with compatible API, do:

```js
const tests = require('libp2p-interfaces-compliance-tests/peer-id')

describe('your peer id', () => {
  // use all of the test suits
  tests({
    setup () {
      return YourPeerIdFactory
    },
    teardown () {
      // Clean up any resources created by setup()
    }
  })
})
```

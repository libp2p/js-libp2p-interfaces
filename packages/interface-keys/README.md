# @libp2p/interface-keys <!-- omit in toc -->

[![test & maybe release](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml/badge.svg)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml)

> Keys interface for libp2p

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Using the Test Suite](#using-the-test-suite)
- [License](#license)
  - [Contribution](#contribution)

## Install

```console
$ npm i @libp2p/interface-keys
```

## Using the Test Suite

You can also check out the [internal test suite](../../test/crypto/compliance.spec.js) to see the setup in action.

```js
const tests = require('libp2p-interfaces-compliance-tests/keys')
const yourKeys = require('./your-keys')

tests({
  setup () {
    // Set up your keys if needed, then return it
    return yourKeys
  },
  teardown () {
    // Clean up your keys if needed
  }
})
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

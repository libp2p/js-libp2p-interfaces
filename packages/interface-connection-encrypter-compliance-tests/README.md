# @libp2p/interface-connection-encrypter-compliance-tests <!-- omit in toc -->

[![libp2p.io](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![Discuss](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg?style=flat-square)](https://discuss.libp2p.io)
[![codecov](https://img.shields.io/codecov/c/github/libp2p/js-libp2p-interfaces.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-interfaces)
[![CI](https://img.shields.io/github/workflow/status/libp2p/js-libp2p-interfaces/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml)

> Compliance tests for implementations of the libp2p Connection Encrypter interface

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [API Docs](#api-docs)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i @libp2p/interface-connection-encrypter-compliance-tests
```

## Usage

```js
import tests from '@libp2p/interface-connection-encrypter-compliance-tests'
import yourCrypto from './your-encrypter'

tests({
  setup () {
    // Set up your crypto if needed, then return it
    return yourCrypto
  },
  teardown () {
    // Clean up your crypto if needed
  }
})
```

## API Docs

- <https://libp2p.github.io/js-libp2p-interfaces>

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

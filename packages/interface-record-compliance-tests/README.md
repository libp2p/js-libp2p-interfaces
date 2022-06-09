# @libp2p/interface-record-compliance-tests <!-- omit in toc -->

[![test & maybe release](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml/badge.svg)](https://github.com/libp2p/js-libp2p-interfaces/actions/workflows/js-test-and-release.yml)

> Compliance tests for implementations of the libp2p Record interface

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [License](#license)
  - [Contribution](#contribution)

## Install

```console
$ npm i @libp2p/interface-record-compliance-tests
```

## Usage

```js
import tests from '@libp2p/interface-record-tests'

describe('your record implementation', () => {
  tests({
    // Options should be passed to your implementation
    async setup (options) {
      return new YourImplementation()
    },
    async teardown () {
      // cleanup resources created by setup()
    }
  })
})
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

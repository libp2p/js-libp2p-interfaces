## [@libp2p/interface-pubsub-compliance-tests-v4.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v4.0.0...@libp2p/interface-pubsub-compliance-tests-v4.0.1) (2022-11-05)


### Bug Fixes

* update project config ([#311](https://github.com/libp2p/js-libp2p-interfaces/issues/311)) ([27dd0ce](https://github.com/libp2p/js-libp2p-interfaces/commit/27dd0ce3c249892ac69cbb24ddaf0b9f32385e37))


### Dependencies

* update sibling dependencies ([45af2ca](https://github.com/libp2p/js-libp2p-interfaces/commit/45af2cadd55ad58d0c5ee2d11a0b8a39f6300454))

## [@libp2p/interface-pubsub-compliance-tests-v4.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v3.0.0...@libp2p/interface-pubsub-compliance-tests-v4.0.0) (2022-10-12)


### ⚠ BREAKING CHANGES

* modules no longer implement `Initializable` instead switching to constructor injection

### Bug Fixes

* export network components type ([79a5d8f](https://github.com/libp2p/js-libp2p-interfaces/commit/79a5d8fc57ae47274ff9ad9c3969c5898f07eb1d))
* remove @libp2p/components ([#301](https://github.com/libp2p/js-libp2p-interfaces/issues/301)) ([1d37dc6](https://github.com/libp2p/js-libp2p-interfaces/commit/1d37dc6d3197838a71895d5769ad8bba6eb38fd3))
* update mock network components use ([c760e95](https://github.com/libp2p/js-libp2p-interfaces/commit/c760e95f07b6199f08adb20c1e3a4265649fdda0))


### Dependencies

* update sibling dependencies ([d3226f7](https://github.com/libp2p/js-libp2p-interfaces/commit/d3226f7383de85cae2b4771c22eea22c4bb5bbeb))

## [@libp2p/interface-pubsub-compliance-tests-v3.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.5...@libp2p/interface-pubsub-compliance-tests-v3.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* add topicValidators to pubsub interface (#298)

### Bug Fixes

* add topicValidators to pubsub interface ([#298](https://github.com/libp2p/js-libp2p-interfaces/issues/298)) ([e5ff819](https://github.com/libp2p/js-libp2p-interfaces/commit/e5ff819c6dd235b2ea9ea5133457b384c4411cf3))


### Dependencies

* update sibling dependencies ([8f3680e](https://github.com/libp2p/js-libp2p-interfaces/commit/8f3680e2d87e424936dfe7128b859795f0327d9a))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.5](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.4...@libp2p/interface-pubsub-compliance-tests-v2.0.5) (2022-10-07)


### Dependencies

* bump @libp2p/components from 2.1.1 to 3.0.0 ([#299](https://github.com/libp2p/js-libp2p-interfaces/issues/299)) ([b3f493c](https://github.com/libp2p/js-libp2p-interfaces/commit/b3f493c5e260f697f66de54b56379d036ca3db59))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.4](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.3...@libp2p/interface-pubsub-compliance-tests-v2.0.4) (2022-10-06)


### Dependencies

* update sibling dependencies ([2f46d7f](https://github.com/libp2p/js-libp2p-interfaces/commit/2f46d7ff4189c29a63bac93b0b5b73de0a75922f))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.3](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.2...@libp2p/interface-pubsub-compliance-tests-v2.0.3) (2022-10-04)


### Dependencies

* update sibling dependencies ([1b11e8e](https://github.com/libp2p/js-libp2p-interfaces/commit/1b11e8e9cc2ea1d4d26233f9c11a57e185ea23ed))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.2](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.1...@libp2p/interface-pubsub-compliance-tests-v2.0.2) (2022-08-10)


### Dependencies

* update sibling dependencies ([fc4c49c](https://github.com/libp2p/js-libp2p-interfaces/commit/fc4c49c22334b9f2059b08e13ba94f3e8938482e))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v2.0.0...@libp2p/interface-pubsub-compliance-tests-v2.0.1) (2022-07-31)


### Dependencies

* update uint8arraylist and p-wait-for deps ([#274](https://github.com/libp2p/js-libp2p-interfaces/issues/274)) ([c55f12e](https://github.com/libp2p/js-libp2p-interfaces/commit/c55f12e47be0a10e41709b0d6a60dd8bc1209ee5))

## [@libp2p/interface-pubsub-compliance-tests-v2.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v1.0.4...@libp2p/interface-pubsub-compliance-tests-v2.0.0) (2022-07-31)


### ⚠ BREAKING CHANGES

* The `Message` type is now either a `SignedMessage`
or a `UnsignedMessage`

### Features

* pubsub Message types for signature policies ([#266](https://github.com/libp2p/js-libp2p-interfaces/issues/266)) ([9eb710b](https://github.com/libp2p/js-libp2p-interfaces/commit/9eb710bcbdb0aef95c7a8613e00065a3b7c7f887))


### Trivial Changes

* update project config ([#271](https://github.com/libp2p/js-libp2p-interfaces/issues/271)) ([59c0bf5](https://github.com/libp2p/js-libp2p-interfaces/commit/59c0bf5e0b05496fca2e4902632b61bb41fad9e9))
* update sibling dependencies [skip ci] ([fbd5281](https://github.com/libp2p/js-libp2p-interfaces/commit/fbd52811b1d074df0755a3ee10c33a99ccc86842))

## [@libp2p/interface-pubsub-compliance-tests-v1.0.4](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v1.0.3...@libp2p/interface-pubsub-compliance-tests-v1.0.4) (2022-06-27)


### Trivial Changes

* update deps ([#262](https://github.com/libp2p/js-libp2p-interfaces/issues/262)) ([51edf7d](https://github.com/libp2p/js-libp2p-interfaces/commit/51edf7d9b3765a6f75c915b1483ea345d0133a41))

## [@libp2p/interface-pubsub-compliance-tests-v1.0.3](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v1.0.2...@libp2p/interface-pubsub-compliance-tests-v1.0.3) (2022-06-24)


### Trivial Changes

* update sibling dependencies [skip ci] ([c5c41c5](https://github.com/libp2p/js-libp2p-interfaces/commit/c5c41c521cf970addc1840d8519cdaa542a0db16))

## [@libp2p/interface-pubsub-compliance-tests-v1.0.2](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v1.0.1...@libp2p/interface-pubsub-compliance-tests-v1.0.2) (2022-06-16)


### Trivial Changes

* update deps ([54fbb37](https://github.com/libp2p/js-libp2p-interfaces/commit/54fbb37c8644a3fd6833c12550a57bf1a9292902))
* update deps ([970a940](https://github.com/libp2p/js-libp2p-interfaces/commit/970a940a2f65b946936a53febdc52527baefbd34))

## [@libp2p/interface-pubsub-compliance-tests-v1.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/@libp2p/interface-pubsub-compliance-tests-v1.0.0...@libp2p/interface-pubsub-compliance-tests-v1.0.1) (2022-06-14)


### Trivial Changes

* update components module ([#235](https://github.com/libp2p/js-libp2p-interfaces/issues/235)) ([5844207](https://github.com/libp2p/js-libp2p-interfaces/commit/58442070af59aa852c83ec3aecdbd1d2c646b018))

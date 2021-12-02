# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@2.0.0...libp2p-interfaces-compliance-tests@3.0.0) (2021-12-02)


### chore

* update libp2p-crypto and peer-id ([c711e8b](https://github.com/libp2p/js-libp2p-interfaces/commit/c711e8bd4d606f6974b13fad2eeb723f93cebb87))


### BREAKING CHANGES

* requires node 15+





# [2.0.0](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@1.1.2...libp2p-interfaces-compliance-tests@2.0.0) (2021-11-22)


### Features

* split out code, convert to typescript ([#111](https://github.com/libp2p/js-libp2p-interfaces/issues/111)) ([e174bba](https://github.com/libp2p/js-libp2p-interfaces/commit/e174bba889388269b806643c79a6b53c8d6a0f8c)), closes [#110](https://github.com/libp2p/js-libp2p-interfaces/issues/110) [#101](https://github.com/libp2p/js-libp2p-interfaces/issues/101)


### BREAKING CHANGES

* not all fields from concrete classes have been added to the interfaces, some adjustment may be necessary as this gets rolled out





## [1.1.2](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@1.1.1...libp2p-interfaces-compliance-tests@1.1.2) (2021-10-18)

**Note:** Version bump only for package libp2p-interfaces-compliance-tests





## [1.1.1](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@1.1.0...libp2p-interfaces-compliance-tests@1.1.1) (2021-09-20)

**Note:** Version bump only for package libp2p-interfaces-compliance-tests





# [1.1.0](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@1.0.1...libp2p-interfaces-compliance-tests@1.1.0) (2021-08-20)


### Features

* update uint8arrays ([#105](https://github.com/libp2p/js-libp2p-interfaces/issues/105)) ([9297a9c](https://github.com/libp2p/js-libp2p-interfaces/commit/9297a9c379276d03c8da849af6108b38e581b4a6))





## [1.0.1](https://github.com/libp2p/js-libp2p-interfaces/compare/libp2p-interfaces-compliance-tests@1.0.0...libp2p-interfaces-compliance-tests@1.0.1) (2021-07-08)


### Bug Fixes

* make tests more reliable ([#103](https://github.com/libp2p/js-libp2p-interfaces/issues/103)) ([cd4c409](https://github.com/libp2p/js-libp2p-interfaces/commit/cd4c40908efe2e9ffc14aa61aace5176a43fd70a))
* remove timeouts ([#104](https://github.com/libp2p/js-libp2p-interfaces/issues/104)) ([3699c17](https://github.com/libp2p/js-libp2p-interfaces/commit/3699c17f022da40a87ab24adc3b2081df7a0ddcd))





# 1.0.0 (2021-07-07)


### chore

* monorepo separating interfaces and compliance tests ([#97](https://github.com/libp2p/js-libp2p-interfaces/issues/97)) ([946348f](https://github.com/libp2p/js-libp2p-interfaces/commit/946348f7f8acc1ff7bc9cd0ab4c2602d41106f76))


### BREAKING CHANGES

* the tests now live in the libp2p-interfaces-compliance-tests module

var crypto = require('crypto')
var multihashing = require('multihashing')
var ipld = require('ipld')
var ecdsa = require('ecdsa')

module.exports.all = function (test, common) {

  test('Store a valid record', function (t) {
    common.setup(test, function (err, recordStore) {
      t.ifError(err, 'Should not throw')

      var mdagStore = recordStore.mdagStore

      var ecdh = crypto.createECDH('secp256k1')
      ecdh.generateKeys()

      var mdagObj_pubKey = {
        '@context': ipld.context.merkleweb,
        algorithm: {
          mlink: 'secp256k1'
        },
        encoding: {
          mlink: 'raw'
        },
        bytes: ecdh.getPublicKey()
      }

      var mdagObj_pubKey_encoded = ipld.marshal(mdagObj_pubKey)
      var mdagObj_pubKey_mh = multihashing(mdagObj_pubKey_encoded, 'sha2-256')
      mdagStore.put(mdagObj_pubKey, mdagObj_pubKey_mh)

      var current = new Date()

      var mdagObj_record = {
        '@context': ipld.context.merkleweb,
        scheme: {
          mlink: 'type-a'
        },
        expires: (new Date()).setDate(current.getDate() + 1),
        value: 'aaah the data!'
      }

      var mdagObj_record_encoded = ipld.marshal(mdagObj_record)
      var mdagObj_record_mh = multihashing(mdagObj_record_encoded, 'sha2-256')
      mdagStore.put(mdagObj_record, mdagObj_record_mh)

      var mdagObj_record_encoded_hash = crypto.createHash('sha256').update(mdagObj_record_encoded).digest()
      var record_signed = ecdsa.sign(mdagObj_record_encoded_hash, ecdh.getPrivateKey())

      var mdagObj_record_signature = {
        '@context': ipld.context.merkleweb,
        pubKey: {
          mlink: mdagObj_pubKey_mh
        },
        algorithm: {
          mlink: 'secp256k1'
        },
        encoding: {
          mlink: 'binary'
        },
        signee: {
          mlink: mdagObj_record_mh
        },
        bytes: record_signed
      }

      var mdagObj_record_signature_encoded = ipld.marshal(mdagObj_record_signature)
      var mdagObj_record_signature_encoded_mh = multihashing(mdagObj_record_signature_encoded, 'sha2-256')

      mdagStore.put(mdagObj_record_signature, mdagObj_record_signature_encoded_mh)

      recordStore.put('bananas', mdagObj_record_signature, function (err) {
        t.ifError(err, 'Should not throw')
        recordStore.get('bananas', function (err, records) {
          t.ifError(err, 'Should not throw')
          t.equal(records.length, 1)
          t.pass('record was stored successfully')
          t.end()
        })

      })
    })
  })

  // test('Store an unvalid record')
  // test('Store and retrieve a valid record')
  // test('Store a bunch of valid and unvalid records and check what gets retrieved')
  // test('Store a bunch of records with variable validity, wait for some to expire, check what gets retrieved')

}

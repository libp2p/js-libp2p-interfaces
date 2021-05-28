/*eslint-disable*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["libp2p-pubsub-topic-descriptor"] || ($protobuf.roots["libp2p-pubsub-topic-descriptor"] = {});

$root.TopicDescriptor = (function() {

    /**
     * Properties of a TopicDescriptor.
     * @exports ITopicDescriptor
     * @interface ITopicDescriptor
     * @property {string|null} [name] TopicDescriptor name
     * @property {TopicDescriptor.IAuthOpts|null} [auth] TopicDescriptor auth
     * @property {TopicDescriptor.IEncOpts|null} [enc] TopicDescriptor enc
     */

    /**
     * Constructs a new TopicDescriptor.
     * @exports TopicDescriptor
     * @classdesc Represents a TopicDescriptor.
     * @implements ITopicDescriptor
     * @constructor
     * @param {ITopicDescriptor=} [p] Properties to set
     */
    function TopicDescriptor(p) {
        if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null)
                    this[ks[i]] = p[ks[i]];
    }

    /**
     * TopicDescriptor name.
     * @member {string|null|undefined} name
     * @memberof TopicDescriptor
     * @instance
     */
    TopicDescriptor.prototype.name = null;

    /**
     * TopicDescriptor auth.
     * @member {TopicDescriptor.IAuthOpts|null|undefined} auth
     * @memberof TopicDescriptor
     * @instance
     */
    TopicDescriptor.prototype.auth = null;

    /**
     * TopicDescriptor enc.
     * @member {TopicDescriptor.IEncOpts|null|undefined} enc
     * @memberof TopicDescriptor
     * @instance
     */
    TopicDescriptor.prototype.enc = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    /**
     * TopicDescriptor _name.
     * @member {"name"|undefined} _name
     * @memberof TopicDescriptor
     * @instance
     */
    Object.defineProperty(TopicDescriptor.prototype, "_name", {
        get: $util.oneOfGetter($oneOfFields = ["name"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * TopicDescriptor _auth.
     * @member {"auth"|undefined} _auth
     * @memberof TopicDescriptor
     * @instance
     */
    Object.defineProperty(TopicDescriptor.prototype, "_auth", {
        get: $util.oneOfGetter($oneOfFields = ["auth"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * TopicDescriptor _enc.
     * @member {"enc"|undefined} _enc
     * @memberof TopicDescriptor
     * @instance
     */
    Object.defineProperty(TopicDescriptor.prototype, "_enc", {
        get: $util.oneOfGetter($oneOfFields = ["enc"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Encodes the specified TopicDescriptor message. Does not implicitly {@link TopicDescriptor.verify|verify} messages.
     * @function encode
     * @memberof TopicDescriptor
     * @static
     * @param {ITopicDescriptor} m TopicDescriptor message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TopicDescriptor.encode = function encode(m, w) {
        if (!w)
            w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
            w.uint32(10).string(m.name);
        if (m.auth != null && Object.hasOwnProperty.call(m, "auth"))
            $root.TopicDescriptor.AuthOpts.encode(m.auth, w.uint32(18).fork()).ldelim();
        if (m.enc != null && Object.hasOwnProperty.call(m, "enc"))
            $root.TopicDescriptor.EncOpts.encode(m.enc, w.uint32(26).fork()).ldelim();
        return w;
    };

    /**
     * Decodes a TopicDescriptor message from the specified reader or buffer.
     * @function decode
     * @memberof TopicDescriptor
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {TopicDescriptor} TopicDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TopicDescriptor.decode = function decode(r, l) {
        if (!(r instanceof $Reader))
            r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l, m = new $root.TopicDescriptor();
        while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
            case 1:
                m.name = r.string();
                break;
            case 2:
                m.auth = $root.TopicDescriptor.AuthOpts.decode(r, r.uint32());
                break;
            case 3:
                m.enc = $root.TopicDescriptor.EncOpts.decode(r, r.uint32());
                break;
            default:
                r.skipType(t & 7);
                break;
            }
        }
        return m;
    };

    /**
     * Creates a TopicDescriptor message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TopicDescriptor
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {TopicDescriptor} TopicDescriptor
     */
    TopicDescriptor.fromObject = function fromObject(d) {
        if (d instanceof $root.TopicDescriptor)
            return d;
        var m = new $root.TopicDescriptor();
        if (d.name != null) {
            m.name = String(d.name);
        }
        if (d.auth != null) {
            if (typeof d.auth !== "object")
                throw TypeError(".TopicDescriptor.auth: object expected");
            m.auth = $root.TopicDescriptor.AuthOpts.fromObject(d.auth);
        }
        if (d.enc != null) {
            if (typeof d.enc !== "object")
                throw TypeError(".TopicDescriptor.enc: object expected");
            m.enc = $root.TopicDescriptor.EncOpts.fromObject(d.enc);
        }
        return m;
    };

    /**
     * Creates a plain object from a TopicDescriptor message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TopicDescriptor
     * @static
     * @param {TopicDescriptor} m TopicDescriptor
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TopicDescriptor.toObject = function toObject(m, o) {
        if (!o)
            o = {};
        var d = {};
        if (m.name != null && m.hasOwnProperty("name")) {
            d.name = m.name;
            if (o.oneofs)
                d._name = "name";
        }
        if (m.auth != null && m.hasOwnProperty("auth")) {
            d.auth = $root.TopicDescriptor.AuthOpts.toObject(m.auth, o);
            if (o.oneofs)
                d._auth = "auth";
        }
        if (m.enc != null && m.hasOwnProperty("enc")) {
            d.enc = $root.TopicDescriptor.EncOpts.toObject(m.enc, o);
            if (o.oneofs)
                d._enc = "enc";
        }
        return d;
    };

    /**
     * Converts this TopicDescriptor to JSON.
     * @function toJSON
     * @memberof TopicDescriptor
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TopicDescriptor.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    TopicDescriptor.AuthOpts = (function() {

        /**
         * Properties of an AuthOpts.
         * @memberof TopicDescriptor
         * @interface IAuthOpts
         * @property {TopicDescriptor.AuthOpts.AuthMode|null} [mode] AuthOpts mode
         * @property {Array.<Uint8Array>|null} [keys] AuthOpts keys
         */

        /**
         * Constructs a new AuthOpts.
         * @memberof TopicDescriptor
         * @classdesc Represents an AuthOpts.
         * @implements IAuthOpts
         * @constructor
         * @param {TopicDescriptor.IAuthOpts=} [p] Properties to set
         */
        function AuthOpts(p) {
            this.keys = [];
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * AuthOpts mode.
         * @member {TopicDescriptor.AuthOpts.AuthMode|null|undefined} mode
         * @memberof TopicDescriptor.AuthOpts
         * @instance
         */
        AuthOpts.prototype.mode = null;

        /**
         * AuthOpts keys.
         * @member {Array.<Uint8Array>} keys
         * @memberof TopicDescriptor.AuthOpts
         * @instance
         */
        AuthOpts.prototype.keys = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * AuthOpts _mode.
         * @member {"mode"|undefined} _mode
         * @memberof TopicDescriptor.AuthOpts
         * @instance
         */
        Object.defineProperty(AuthOpts.prototype, "_mode", {
            get: $util.oneOfGetter($oneOfFields = ["mode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Encodes the specified AuthOpts message. Does not implicitly {@link TopicDescriptor.AuthOpts.verify|verify} messages.
         * @function encode
         * @memberof TopicDescriptor.AuthOpts
         * @static
         * @param {TopicDescriptor.IAuthOpts} m AuthOpts message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AuthOpts.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                w.uint32(8).int32(m.mode);
            if (m.keys != null && m.keys.length) {
                for (var i = 0; i < m.keys.length; ++i)
                    w.uint32(18).bytes(m.keys[i]);
            }
            return w;
        };

        /**
         * Decodes an AuthOpts message from the specified reader or buffer.
         * @function decode
         * @memberof TopicDescriptor.AuthOpts
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {TopicDescriptor.AuthOpts} AuthOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AuthOpts.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.TopicDescriptor.AuthOpts();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.mode = r.int32();
                    break;
                case 2:
                    if (!(m.keys && m.keys.length))
                        m.keys = [];
                    m.keys.push(r.bytes());
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an AuthOpts message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof TopicDescriptor.AuthOpts
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {TopicDescriptor.AuthOpts} AuthOpts
         */
        AuthOpts.fromObject = function fromObject(d) {
            if (d instanceof $root.TopicDescriptor.AuthOpts)
                return d;
            var m = new $root.TopicDescriptor.AuthOpts();
            switch (d.mode) {
            case "NONE":
            case 0:
                m.mode = 0;
                break;
            case "KEY":
            case 1:
                m.mode = 1;
                break;
            case "WOT":
            case 2:
                m.mode = 2;
                break;
            }
            if (d.keys) {
                if (!Array.isArray(d.keys))
                    throw TypeError(".TopicDescriptor.AuthOpts.keys: array expected");
                m.keys = [];
                for (var i = 0; i < d.keys.length; ++i) {
                    if (typeof d.keys[i] === "string")
                        $util.base64.decode(d.keys[i], m.keys[i] = $util.newBuffer($util.base64.length(d.keys[i])), 0);
                    else if (d.keys[i].length)
                        m.keys[i] = d.keys[i];
                }
            }
            return m;
        };

        /**
         * Creates a plain object from an AuthOpts message. Also converts values to other types if specified.
         * @function toObject
         * @memberof TopicDescriptor.AuthOpts
         * @static
         * @param {TopicDescriptor.AuthOpts} m AuthOpts
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AuthOpts.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.arrays || o.defaults) {
                d.keys = [];
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
                d.mode = o.enums === String ? $root.TopicDescriptor.AuthOpts.AuthMode[m.mode] : m.mode;
                if (o.oneofs)
                    d._mode = "mode";
            }
            if (m.keys && m.keys.length) {
                d.keys = [];
                for (var j = 0; j < m.keys.length; ++j) {
                    d.keys[j] = o.bytes === String ? $util.base64.encode(m.keys[j], 0, m.keys[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.keys[j]) : m.keys[j];
                }
            }
            return d;
        };

        /**
         * Converts this AuthOpts to JSON.
         * @function toJSON
         * @memberof TopicDescriptor.AuthOpts
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AuthOpts.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * AuthMode enum.
         * @name TopicDescriptor.AuthOpts.AuthMode
         * @enum {number}
         * @property {number} NONE=0 NONE value
         * @property {number} KEY=1 KEY value
         * @property {number} WOT=2 WOT value
         */
        AuthOpts.AuthMode = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NONE"] = 0;
            values[valuesById[1] = "KEY"] = 1;
            values[valuesById[2] = "WOT"] = 2;
            return values;
        })();

        return AuthOpts;
    })();

    TopicDescriptor.EncOpts = (function() {

        /**
         * Properties of an EncOpts.
         * @memberof TopicDescriptor
         * @interface IEncOpts
         * @property {TopicDescriptor.EncOpts.EncMode|null} [mode] EncOpts mode
         * @property {Array.<Uint8Array>|null} [keyHashes] EncOpts keyHashes
         */

        /**
         * Constructs a new EncOpts.
         * @memberof TopicDescriptor
         * @classdesc Represents an EncOpts.
         * @implements IEncOpts
         * @constructor
         * @param {TopicDescriptor.IEncOpts=} [p] Properties to set
         */
        function EncOpts(p) {
            this.keyHashes = [];
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * EncOpts mode.
         * @member {TopicDescriptor.EncOpts.EncMode|null|undefined} mode
         * @memberof TopicDescriptor.EncOpts
         * @instance
         */
        EncOpts.prototype.mode = null;

        /**
         * EncOpts keyHashes.
         * @member {Array.<Uint8Array>} keyHashes
         * @memberof TopicDescriptor.EncOpts
         * @instance
         */
        EncOpts.prototype.keyHashes = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * EncOpts _mode.
         * @member {"mode"|undefined} _mode
         * @memberof TopicDescriptor.EncOpts
         * @instance
         */
        Object.defineProperty(EncOpts.prototype, "_mode", {
            get: $util.oneOfGetter($oneOfFields = ["mode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Encodes the specified EncOpts message. Does not implicitly {@link TopicDescriptor.EncOpts.verify|verify} messages.
         * @function encode
         * @memberof TopicDescriptor.EncOpts
         * @static
         * @param {TopicDescriptor.IEncOpts} m EncOpts message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        EncOpts.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                w.uint32(8).int32(m.mode);
            if (m.keyHashes != null && m.keyHashes.length) {
                for (var i = 0; i < m.keyHashes.length; ++i)
                    w.uint32(18).bytes(m.keyHashes[i]);
            }
            return w;
        };

        /**
         * Decodes an EncOpts message from the specified reader or buffer.
         * @function decode
         * @memberof TopicDescriptor.EncOpts
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {TopicDescriptor.EncOpts} EncOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        EncOpts.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.TopicDescriptor.EncOpts();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.mode = r.int32();
                    break;
                case 2:
                    if (!(m.keyHashes && m.keyHashes.length))
                        m.keyHashes = [];
                    m.keyHashes.push(r.bytes());
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates an EncOpts message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof TopicDescriptor.EncOpts
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {TopicDescriptor.EncOpts} EncOpts
         */
        EncOpts.fromObject = function fromObject(d) {
            if (d instanceof $root.TopicDescriptor.EncOpts)
                return d;
            var m = new $root.TopicDescriptor.EncOpts();
            switch (d.mode) {
            case "NONE":
            case 0:
                m.mode = 0;
                break;
            case "SHAREDKEY":
            case 1:
                m.mode = 1;
                break;
            case "WOT":
            case 2:
                m.mode = 2;
                break;
            }
            if (d.keyHashes) {
                if (!Array.isArray(d.keyHashes))
                    throw TypeError(".TopicDescriptor.EncOpts.keyHashes: array expected");
                m.keyHashes = [];
                for (var i = 0; i < d.keyHashes.length; ++i) {
                    if (typeof d.keyHashes[i] === "string")
                        $util.base64.decode(d.keyHashes[i], m.keyHashes[i] = $util.newBuffer($util.base64.length(d.keyHashes[i])), 0);
                    else if (d.keyHashes[i].length)
                        m.keyHashes[i] = d.keyHashes[i];
                }
            }
            return m;
        };

        /**
         * Creates a plain object from an EncOpts message. Also converts values to other types if specified.
         * @function toObject
         * @memberof TopicDescriptor.EncOpts
         * @static
         * @param {TopicDescriptor.EncOpts} m EncOpts
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        EncOpts.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.arrays || o.defaults) {
                d.keyHashes = [];
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
                d.mode = o.enums === String ? $root.TopicDescriptor.EncOpts.EncMode[m.mode] : m.mode;
                if (o.oneofs)
                    d._mode = "mode";
            }
            if (m.keyHashes && m.keyHashes.length) {
                d.keyHashes = [];
                for (var j = 0; j < m.keyHashes.length; ++j) {
                    d.keyHashes[j] = o.bytes === String ? $util.base64.encode(m.keyHashes[j], 0, m.keyHashes[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.keyHashes[j]) : m.keyHashes[j];
                }
            }
            return d;
        };

        /**
         * Converts this EncOpts to JSON.
         * @function toJSON
         * @memberof TopicDescriptor.EncOpts
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        EncOpts.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * EncMode enum.
         * @name TopicDescriptor.EncOpts.EncMode
         * @enum {number}
         * @property {number} NONE=0 NONE value
         * @property {number} SHAREDKEY=1 SHAREDKEY value
         * @property {number} WOT=2 WOT value
         */
        EncOpts.EncMode = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "NONE"] = 0;
            values[valuesById[1] = "SHAREDKEY"] = 1;
            values[valuesById[2] = "WOT"] = 2;
            return values;
        })();

        return EncOpts;
    })();

    return TopicDescriptor;
})();

module.exports = $root;

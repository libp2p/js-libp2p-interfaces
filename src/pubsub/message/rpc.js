/*eslint-disable*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["libp2p-pubsub-rpc"] || ($protobuf.roots["libp2p-pubsub-rpc"] = {});

$root.RPC = (function() {

    /**
     * Properties of a RPC.
     * @exports IRPC
     * @interface IRPC
     * @property {Array.<RPC.ISubOpts>|null} [subscriptions] RPC subscriptions
     * @property {Array.<RPC.IMessage>|null} [msgs] RPC msgs
     */

    /**
     * Constructs a new RPC.
     * @exports RPC
     * @classdesc Represents a RPC.
     * @implements IRPC
     * @constructor
     * @param {IRPC=} [p] Properties to set
     */
    function RPC(p) {
        this.subscriptions = [];
        this.msgs = [];
        if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null)
                    this[ks[i]] = p[ks[i]];
    }

    /**
     * RPC subscriptions.
     * @member {Array.<RPC.ISubOpts>} subscriptions
     * @memberof RPC
     * @instance
     */
    RPC.prototype.subscriptions = $util.emptyArray;

    /**
     * RPC msgs.
     * @member {Array.<RPC.IMessage>} msgs
     * @memberof RPC
     * @instance
     */
    RPC.prototype.msgs = $util.emptyArray;

    /**
     * Encodes the specified RPC message. Does not implicitly {@link RPC.verify|verify} messages.
     * @function encode
     * @memberof RPC
     * @static
     * @param {IRPC} m RPC message or plain object to encode
     * @param {$protobuf.Writer} [w] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RPC.encode = function encode(m, w) {
        if (!w)
            w = $Writer.create();
        if (m.subscriptions != null && m.subscriptions.length) {
            for (var i = 0; i < m.subscriptions.length; ++i)
                $root.RPC.SubOpts.encode(m.subscriptions[i], w.uint32(10).fork()).ldelim();
        }
        if (m.msgs != null && m.msgs.length) {
            for (var i = 0; i < m.msgs.length; ++i)
                $root.RPC.Message.encode(m.msgs[i], w.uint32(18).fork()).ldelim();
        }
        return w;
    };

    /**
     * Decodes a RPC message from the specified reader or buffer.
     * @function decode
     * @memberof RPC
     * @static
     * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
     * @param {number} [l] Message length if known beforehand
     * @returns {RPC} RPC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RPC.decode = function decode(r, l) {
        if (!(r instanceof $Reader))
            r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l, m = new $root.RPC();
        while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
            case 1:
                if (!(m.subscriptions && m.subscriptions.length))
                    m.subscriptions = [];
                m.subscriptions.push($root.RPC.SubOpts.decode(r, r.uint32()));
                break;
            case 2:
                if (!(m.msgs && m.msgs.length))
                    m.msgs = [];
                m.msgs.push($root.RPC.Message.decode(r, r.uint32()));
                break;
            default:
                r.skipType(t & 7);
                break;
            }
        }
        return m;
    };

    /**
     * Creates a RPC message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RPC
     * @static
     * @param {Object.<string,*>} d Plain object
     * @returns {RPC} RPC
     */
    RPC.fromObject = function fromObject(d) {
        if (d instanceof $root.RPC)
            return d;
        var m = new $root.RPC();
        if (d.subscriptions) {
            if (!Array.isArray(d.subscriptions))
                throw TypeError(".RPC.subscriptions: array expected");
            m.subscriptions = [];
            for (var i = 0; i < d.subscriptions.length; ++i) {
                if (typeof d.subscriptions[i] !== "object")
                    throw TypeError(".RPC.subscriptions: object expected");
                m.subscriptions[i] = $root.RPC.SubOpts.fromObject(d.subscriptions[i]);
            }
        }
        if (d.msgs) {
            if (!Array.isArray(d.msgs))
                throw TypeError(".RPC.msgs: array expected");
            m.msgs = [];
            for (var i = 0; i < d.msgs.length; ++i) {
                if (typeof d.msgs[i] !== "object")
                    throw TypeError(".RPC.msgs: object expected");
                m.msgs[i] = $root.RPC.Message.fromObject(d.msgs[i]);
            }
        }
        return m;
    };

    /**
     * Creates a plain object from a RPC message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RPC
     * @static
     * @param {RPC} m RPC
     * @param {$protobuf.IConversionOptions} [o] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RPC.toObject = function toObject(m, o) {
        if (!o)
            o = {};
        var d = {};
        if (o.arrays || o.defaults) {
            d.subscriptions = [];
            d.msgs = [];
        }
        if (m.subscriptions && m.subscriptions.length) {
            d.subscriptions = [];
            for (var j = 0; j < m.subscriptions.length; ++j) {
                d.subscriptions[j] = $root.RPC.SubOpts.toObject(m.subscriptions[j], o);
            }
        }
        if (m.msgs && m.msgs.length) {
            d.msgs = [];
            for (var j = 0; j < m.msgs.length; ++j) {
                d.msgs[j] = $root.RPC.Message.toObject(m.msgs[j], o);
            }
        }
        return d;
    };

    /**
     * Converts this RPC to JSON.
     * @function toJSON
     * @memberof RPC
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RPC.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    RPC.SubOpts = (function() {

        /**
         * Properties of a SubOpts.
         * @memberof RPC
         * @interface ISubOpts
         * @property {boolean|null} [subscribe] SubOpts subscribe
         * @property {string|null} [topicID] SubOpts topicID
         */

        /**
         * Constructs a new SubOpts.
         * @memberof RPC
         * @classdesc Represents a SubOpts.
         * @implements ISubOpts
         * @constructor
         * @param {RPC.ISubOpts=} [p] Properties to set
         */
        function SubOpts(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * SubOpts subscribe.
         * @member {boolean|null|undefined} subscribe
         * @memberof RPC.SubOpts
         * @instance
         */
        SubOpts.prototype.subscribe = null;

        /**
         * SubOpts topicID.
         * @member {string|null|undefined} topicID
         * @memberof RPC.SubOpts
         * @instance
         */
        SubOpts.prototype.topicID = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * SubOpts _subscribe.
         * @member {"subscribe"|undefined} _subscribe
         * @memberof RPC.SubOpts
         * @instance
         */
        Object.defineProperty(SubOpts.prototype, "_subscribe", {
            get: $util.oneOfGetter($oneOfFields = ["subscribe"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * SubOpts _topicID.
         * @member {"topicID"|undefined} _topicID
         * @memberof RPC.SubOpts
         * @instance
         */
        Object.defineProperty(SubOpts.prototype, "_topicID", {
            get: $util.oneOfGetter($oneOfFields = ["topicID"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Encodes the specified SubOpts message. Does not implicitly {@link RPC.SubOpts.verify|verify} messages.
         * @function encode
         * @memberof RPC.SubOpts
         * @static
         * @param {RPC.ISubOpts} m SubOpts message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SubOpts.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.subscribe != null && Object.hasOwnProperty.call(m, "subscribe"))
                w.uint32(8).bool(m.subscribe);
            if (m.topicID != null && Object.hasOwnProperty.call(m, "topicID"))
                w.uint32(18).string(m.topicID);
            return w;
        };

        /**
         * Decodes a SubOpts message from the specified reader or buffer.
         * @function decode
         * @memberof RPC.SubOpts
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {RPC.SubOpts} SubOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SubOpts.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.RPC.SubOpts();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.subscribe = r.bool();
                    break;
                case 2:
                    m.topicID = r.string();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a SubOpts message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof RPC.SubOpts
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {RPC.SubOpts} SubOpts
         */
        SubOpts.fromObject = function fromObject(d) {
            if (d instanceof $root.RPC.SubOpts)
                return d;
            var m = new $root.RPC.SubOpts();
            if (d.subscribe != null) {
                m.subscribe = Boolean(d.subscribe);
            }
            if (d.topicID != null) {
                m.topicID = String(d.topicID);
            }
            return m;
        };

        /**
         * Creates a plain object from a SubOpts message. Also converts values to other types if specified.
         * @function toObject
         * @memberof RPC.SubOpts
         * @static
         * @param {RPC.SubOpts} m SubOpts
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SubOpts.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (m.subscribe != null && m.hasOwnProperty("subscribe")) {
                d.subscribe = m.subscribe;
                if (o.oneofs)
                    d._subscribe = "subscribe";
            }
            if (m.topicID != null && m.hasOwnProperty("topicID")) {
                d.topicID = m.topicID;
                if (o.oneofs)
                    d._topicID = "topicID";
            }
            return d;
        };

        /**
         * Converts this SubOpts to JSON.
         * @function toJSON
         * @memberof RPC.SubOpts
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SubOpts.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SubOpts;
    })();

    RPC.Message = (function() {

        /**
         * Properties of a Message.
         * @memberof RPC
         * @interface IMessage
         * @property {Uint8Array|null} [from] Message from
         * @property {Uint8Array|null} [data] Message data
         * @property {Uint8Array|null} [seqno] Message seqno
         * @property {Array.<string>|null} [topicIDs] Message topicIDs
         * @property {Uint8Array|null} [signature] Message signature
         * @property {Uint8Array|null} [key] Message key
         */

        /**
         * Constructs a new Message.
         * @memberof RPC
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {RPC.IMessage=} [p] Properties to set
         */
        function Message(p) {
            this.topicIDs = [];
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * Message from.
         * @member {Uint8Array|null|undefined} from
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.from = null;

        /**
         * Message data.
         * @member {Uint8Array|null|undefined} data
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.data = null;

        /**
         * Message seqno.
         * @member {Uint8Array|null|undefined} seqno
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.seqno = null;

        /**
         * Message topicIDs.
         * @member {Array.<string>} topicIDs
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.topicIDs = $util.emptyArray;

        /**
         * Message signature.
         * @member {Uint8Array|null|undefined} signature
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.signature = null;

        /**
         * Message key.
         * @member {Uint8Array|null|undefined} key
         * @memberof RPC.Message
         * @instance
         */
        Message.prototype.key = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Message _from.
         * @member {"from"|undefined} _from
         * @memberof RPC.Message
         * @instance
         */
        Object.defineProperty(Message.prototype, "_from", {
            get: $util.oneOfGetter($oneOfFields = ["from"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Message _data.
         * @member {"data"|undefined} _data
         * @memberof RPC.Message
         * @instance
         */
        Object.defineProperty(Message.prototype, "_data", {
            get: $util.oneOfGetter($oneOfFields = ["data"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Message _seqno.
         * @member {"seqno"|undefined} _seqno
         * @memberof RPC.Message
         * @instance
         */
        Object.defineProperty(Message.prototype, "_seqno", {
            get: $util.oneOfGetter($oneOfFields = ["seqno"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Message _signature.
         * @member {"signature"|undefined} _signature
         * @memberof RPC.Message
         * @instance
         */
        Object.defineProperty(Message.prototype, "_signature", {
            get: $util.oneOfGetter($oneOfFields = ["signature"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Message _key.
         * @member {"key"|undefined} _key
         * @memberof RPC.Message
         * @instance
         */
        Object.defineProperty(Message.prototype, "_key", {
            get: $util.oneOfGetter($oneOfFields = ["key"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Encodes the specified Message message. Does not implicitly {@link RPC.Message.verify|verify} messages.
         * @function encode
         * @memberof RPC.Message
         * @static
         * @param {RPC.IMessage} m Message message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.from != null && Object.hasOwnProperty.call(m, "from"))
                w.uint32(10).bytes(m.from);
            if (m.data != null && Object.hasOwnProperty.call(m, "data"))
                w.uint32(18).bytes(m.data);
            if (m.seqno != null && Object.hasOwnProperty.call(m, "seqno"))
                w.uint32(26).bytes(m.seqno);
            if (m.topicIDs != null && m.topicIDs.length) {
                for (var i = 0; i < m.topicIDs.length; ++i)
                    w.uint32(34).string(m.topicIDs[i]);
            }
            if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
                w.uint32(42).bytes(m.signature);
            if (m.key != null && Object.hasOwnProperty.call(m, "key"))
                w.uint32(50).bytes(m.key);
            return w;
        };

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof RPC.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {RPC.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.RPC.Message();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.from = r.bytes();
                    break;
                case 2:
                    m.data = r.bytes();
                    break;
                case 3:
                    m.seqno = r.bytes();
                    break;
                case 4:
                    if (!(m.topicIDs && m.topicIDs.length))
                        m.topicIDs = [];
                    m.topicIDs.push(r.string());
                    break;
                case 5:
                    m.signature = r.bytes();
                    break;
                case 6:
                    m.key = r.bytes();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof RPC.Message
         * @static
         * @param {Object.<string,*>} d Plain object
         * @returns {RPC.Message} Message
         */
        Message.fromObject = function fromObject(d) {
            if (d instanceof $root.RPC.Message)
                return d;
            var m = new $root.RPC.Message();
            if (d.from != null) {
                if (typeof d.from === "string")
                    $util.base64.decode(d.from, m.from = $util.newBuffer($util.base64.length(d.from)), 0);
                else if (d.from.length)
                    m.from = d.from;
            }
            if (d.data != null) {
                if (typeof d.data === "string")
                    $util.base64.decode(d.data, m.data = $util.newBuffer($util.base64.length(d.data)), 0);
                else if (d.data.length)
                    m.data = d.data;
            }
            if (d.seqno != null) {
                if (typeof d.seqno === "string")
                    $util.base64.decode(d.seqno, m.seqno = $util.newBuffer($util.base64.length(d.seqno)), 0);
                else if (d.seqno.length)
                    m.seqno = d.seqno;
            }
            if (d.topicIDs) {
                if (!Array.isArray(d.topicIDs))
                    throw TypeError(".RPC.Message.topicIDs: array expected");
                m.topicIDs = [];
                for (var i = 0; i < d.topicIDs.length; ++i) {
                    m.topicIDs[i] = String(d.topicIDs[i]);
                }
            }
            if (d.signature != null) {
                if (typeof d.signature === "string")
                    $util.base64.decode(d.signature, m.signature = $util.newBuffer($util.base64.length(d.signature)), 0);
                else if (d.signature.length)
                    m.signature = d.signature;
            }
            if (d.key != null) {
                if (typeof d.key === "string")
                    $util.base64.decode(d.key, m.key = $util.newBuffer($util.base64.length(d.key)), 0);
                else if (d.key.length)
                    m.key = d.key;
            }
            return m;
        };

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof RPC.Message
         * @static
         * @param {RPC.Message} m Message
         * @param {$protobuf.IConversionOptions} [o] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Message.toObject = function toObject(m, o) {
            if (!o)
                o = {};
            var d = {};
            if (o.arrays || o.defaults) {
                d.topicIDs = [];
            }
            if (m.from != null && m.hasOwnProperty("from")) {
                d.from = o.bytes === String ? $util.base64.encode(m.from, 0, m.from.length) : o.bytes === Array ? Array.prototype.slice.call(m.from) : m.from;
                if (o.oneofs)
                    d._from = "from";
            }
            if (m.data != null && m.hasOwnProperty("data")) {
                d.data = o.bytes === String ? $util.base64.encode(m.data, 0, m.data.length) : o.bytes === Array ? Array.prototype.slice.call(m.data) : m.data;
                if (o.oneofs)
                    d._data = "data";
            }
            if (m.seqno != null && m.hasOwnProperty("seqno")) {
                d.seqno = o.bytes === String ? $util.base64.encode(m.seqno, 0, m.seqno.length) : o.bytes === Array ? Array.prototype.slice.call(m.seqno) : m.seqno;
                if (o.oneofs)
                    d._seqno = "seqno";
            }
            if (m.topicIDs && m.topicIDs.length) {
                d.topicIDs = [];
                for (var j = 0; j < m.topicIDs.length; ++j) {
                    d.topicIDs[j] = m.topicIDs[j];
                }
            }
            if (m.signature != null && m.hasOwnProperty("signature")) {
                d.signature = o.bytes === String ? $util.base64.encode(m.signature, 0, m.signature.length) : o.bytes === Array ? Array.prototype.slice.call(m.signature) : m.signature;
                if (o.oneofs)
                    d._signature = "signature";
            }
            if (m.key != null && m.hasOwnProperty("key")) {
                d.key = o.bytes === String ? $util.base64.encode(m.key, 0, m.key.length) : o.bytes === Array ? Array.prototype.slice.call(m.key) : m.key;
                if (o.oneofs)
                    d._key = "key";
            }
            return d;
        };

        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof RPC.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Message;
    })();

    return RPC;
})();

module.exports = $root;

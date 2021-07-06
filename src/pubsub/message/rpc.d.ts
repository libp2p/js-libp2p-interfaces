import * as $protobuf from "protobufjs";
/** Properties of a RPC. */
export interface IRPC {

    /** RPC subscriptions */
    subscriptions?: (RPC.ISubOpts[]|null);

    /** RPC msgs */
    msgs?: (RPC.IMessage[]|null);
}

/** Represents a RPC. */
export class RPC implements IRPC {

    /**
     * Constructs a new RPC.
     * @param [p] Properties to set
     */
    constructor(p?: IRPC);

    /** RPC subscriptions. */
    public subscriptions: RPC.ISubOpts[];

    /** RPC msgs. */
    public msgs: RPC.IMessage[];

    /**
     * Encodes the specified RPC message. Does not implicitly {@link RPC.verify|verify} messages.
     * @param m RPC message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(m: IRPC, w?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RPC message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns RPC
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): RPC;

    /**
     * Creates a RPC message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns RPC
     */
    public static fromObject(d: { [k: string]: any }): RPC;

    /**
     * Creates a plain object from a RPC message. Also converts values to other types if specified.
     * @param m RPC
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(m: RPC, o?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RPC to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace RPC {

    /** Properties of a SubOpts. */
    interface ISubOpts {

        /** SubOpts subscribe */
        subscribe?: (boolean|null);

        /** SubOpts topicID */
        topicID?: (string|null);
    }

    /** Represents a SubOpts. */
    class SubOpts implements ISubOpts {

        /**
         * Constructs a new SubOpts.
         * @param [p] Properties to set
         */
        constructor(p?: RPC.ISubOpts);

        /** SubOpts subscribe. */
        public subscribe?: (boolean|null);

        /** SubOpts topicID. */
        public topicID?: (string|null);

        /** SubOpts _subscribe. */
        public _subscribe?: "subscribe";

        /** SubOpts _topicID. */
        public _topicID?: "topicID";

        /**
         * Encodes the specified SubOpts message. Does not implicitly {@link RPC.SubOpts.verify|verify} messages.
         * @param m SubOpts message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: RPC.ISubOpts, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SubOpts message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SubOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): RPC.SubOpts;

        /**
         * Creates a SubOpts message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SubOpts
         */
        public static fromObject(d: { [k: string]: any }): RPC.SubOpts;

        /**
         * Creates a plain object from a SubOpts message. Also converts values to other types if specified.
         * @param m SubOpts
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: RPC.SubOpts, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SubOpts to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Message. */
    interface IMessage {

        /** Message from */
        from?: (Uint8Array|null);

        /** Message data */
        data?: (Uint8Array|null);

        /** Message seqno */
        seqno?: (Uint8Array|null);

        /** Message topicIDs */
        topicIDs?: (string[]|null);

        /** Message signature */
        signature?: (Uint8Array|null);

        /** Message key */
        key?: (Uint8Array|null);
    }

    /** Represents a Message. */
    class Message implements IMessage {

        /**
         * Constructs a new Message.
         * @param [p] Properties to set
         */
        constructor(p?: RPC.IMessage);

        /** Message from. */
        public from?: (Uint8Array|null);

        /** Message data. */
        public data?: (Uint8Array|null);

        /** Message seqno. */
        public seqno?: (Uint8Array|null);

        /** Message topicIDs. */
        public topicIDs: string[];

        /** Message signature. */
        public signature?: (Uint8Array|null);

        /** Message key. */
        public key?: (Uint8Array|null);

        /** Message _from. */
        public _from?: "from";

        /** Message _data. */
        public _data?: "data";

        /** Message _seqno. */
        public _seqno?: "seqno";

        /** Message _signature. */
        public _signature?: "signature";

        /** Message _key. */
        public _key?: "key";

        /**
         * Encodes the specified Message message. Does not implicitly {@link RPC.Message.verify|verify} messages.
         * @param m Message message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: RPC.IMessage, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): RPC.Message;

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Message
         */
        public static fromObject(d: { [k: string]: any }): RPC.Message;

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @param m Message
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: RPC.Message, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Message to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

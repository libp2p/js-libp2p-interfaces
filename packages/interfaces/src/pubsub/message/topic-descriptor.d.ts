import * as $protobuf from "protobufjs";
/** Properties of a TopicDescriptor. */
export interface ITopicDescriptor {

    /** TopicDescriptor name */
    name?: (string|null);

    /** TopicDescriptor auth */
    auth?: (TopicDescriptor.IAuthOpts|null);

    /** TopicDescriptor enc */
    enc?: (TopicDescriptor.IEncOpts|null);
}

/** Represents a TopicDescriptor. */
export class TopicDescriptor implements ITopicDescriptor {

    /**
     * Constructs a new TopicDescriptor.
     * @param [p] Properties to set
     */
    constructor(p?: ITopicDescriptor);

    /** TopicDescriptor name. */
    public name?: (string|null);

    /** TopicDescriptor auth. */
    public auth?: (TopicDescriptor.IAuthOpts|null);

    /** TopicDescriptor enc. */
    public enc?: (TopicDescriptor.IEncOpts|null);

    /** TopicDescriptor _name. */
    public _name?: "name";

    /** TopicDescriptor _auth. */
    public _auth?: "auth";

    /** TopicDescriptor _enc. */
    public _enc?: "enc";

    /**
     * Encodes the specified TopicDescriptor message. Does not implicitly {@link TopicDescriptor.verify|verify} messages.
     * @param m TopicDescriptor message or plain object to encode
     * @param [w] Writer to encode to
     * @returns Writer
     */
    public static encode(m: ITopicDescriptor, w?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TopicDescriptor message from the specified reader or buffer.
     * @param r Reader or buffer to decode from
     * @param [l] Message length if known beforehand
     * @returns TopicDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): TopicDescriptor;

    /**
     * Creates a TopicDescriptor message from a plain object. Also converts values to their respective internal types.
     * @param d Plain object
     * @returns TopicDescriptor
     */
    public static fromObject(d: { [k: string]: any }): TopicDescriptor;

    /**
     * Creates a plain object from a TopicDescriptor message. Also converts values to other types if specified.
     * @param m TopicDescriptor
     * @param [o] Conversion options
     * @returns Plain object
     */
    public static toObject(m: TopicDescriptor, o?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TopicDescriptor to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace TopicDescriptor {

    /** Properties of an AuthOpts. */
    interface IAuthOpts {

        /** AuthOpts mode */
        mode?: (TopicDescriptor.AuthOpts.AuthMode|null);

        /** AuthOpts keys */
        keys?: (Uint8Array[]|null);
    }

    /** Represents an AuthOpts. */
    class AuthOpts implements IAuthOpts {

        /**
         * Constructs a new AuthOpts.
         * @param [p] Properties to set
         */
        constructor(p?: TopicDescriptor.IAuthOpts);

        /** AuthOpts mode. */
        public mode?: (TopicDescriptor.AuthOpts.AuthMode|null);

        /** AuthOpts keys. */
        public keys: Uint8Array[];

        /** AuthOpts _mode. */
        public _mode?: "mode";

        /**
         * Encodes the specified AuthOpts message. Does not implicitly {@link TopicDescriptor.AuthOpts.verify|verify} messages.
         * @param m AuthOpts message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: TopicDescriptor.IAuthOpts, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AuthOpts message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AuthOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): TopicDescriptor.AuthOpts;

        /**
         * Creates an AuthOpts message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns AuthOpts
         */
        public static fromObject(d: { [k: string]: any }): TopicDescriptor.AuthOpts;

        /**
         * Creates a plain object from an AuthOpts message. Also converts values to other types if specified.
         * @param m AuthOpts
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: TopicDescriptor.AuthOpts, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AuthOpts to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace AuthOpts {

        /** AuthMode enum. */
        enum AuthMode {
            NONE = 0,
            KEY = 1,
            WOT = 2
        }
    }

    /** Properties of an EncOpts. */
    interface IEncOpts {

        /** EncOpts mode */
        mode?: (TopicDescriptor.EncOpts.EncMode|null);

        /** EncOpts keyHashes */
        keyHashes?: (Uint8Array[]|null);
    }

    /** Represents an EncOpts. */
    class EncOpts implements IEncOpts {

        /**
         * Constructs a new EncOpts.
         * @param [p] Properties to set
         */
        constructor(p?: TopicDescriptor.IEncOpts);

        /** EncOpts mode. */
        public mode?: (TopicDescriptor.EncOpts.EncMode|null);

        /** EncOpts keyHashes. */
        public keyHashes: Uint8Array[];

        /** EncOpts _mode. */
        public _mode?: "mode";

        /**
         * Encodes the specified EncOpts message. Does not implicitly {@link TopicDescriptor.EncOpts.verify|verify} messages.
         * @param m EncOpts message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: TopicDescriptor.IEncOpts, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EncOpts message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns EncOpts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): TopicDescriptor.EncOpts;

        /**
         * Creates an EncOpts message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns EncOpts
         */
        public static fromObject(d: { [k: string]: any }): TopicDescriptor.EncOpts;

        /**
         * Creates a plain object from an EncOpts message. Also converts values to other types if specified.
         * @param m EncOpts
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(m: TopicDescriptor.EncOpts, o?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EncOpts to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace EncOpts {

        /** EncMode enum. */
        enum EncMode {
            NONE = 0,
            SHAREDKEY = 1,
            WOT = 2
        }
    }
}

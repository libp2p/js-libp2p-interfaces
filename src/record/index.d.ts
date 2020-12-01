export = Record;
/**
 * Record is the base implementation of a record that can be used as the payload of a libp2p envelope.
 */
declare class Record {
    /**
     * @class
     * @param {string} domain - signature domain
     * @param {Uint8Array} codec - identifier of the type of record
     */
    constructor(domain: string, codec: Uint8Array);
    domain: string;
    codec: Uint8Array;
    /**
     * Marshal a record to be used in an envelope.
     * @returns {Uint8Array}
     */
    marshal(): Uint8Array;
    /**
     * Verifies if the other provided Record is identical to this one.
     *
     * @param {Record} other
     * @returns {boolean}
     */
    equals(other: Record): boolean;
}

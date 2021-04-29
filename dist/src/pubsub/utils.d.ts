export type IMessage = import('./message/rpc').RPC.IMessage;
export type Message = import('./message/rpc').RPC.Message;
export type NormalizedIMessage = import('.').InMessage;
/**
 * @typedef {import('./message/rpc').RPC.IMessage} IMessage
 * @typedef {import('./message/rpc').RPC.Message} Message
 * @typedef {import('.').InMessage} NormalizedIMessage
 */
/**
 * Generatea random sequence number.
 *
 * @returns {Uint8Array}
 * @private
 */
export function randomSeqno(): Uint8Array;
/**
 * Generate a message id, based on the `from` and `seqno`.
 *
 * @param {string} from
 * @param {Uint8Array} seqno
 * @returns {Uint8Array}
 * @private
 */
export function msgId(from: string, seqno: Uint8Array): Uint8Array;
/**
 * Generate a message id, based on message `data`.
 *
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 * @private
 */
export function noSignMsgId(data: Uint8Array): Uint8Array;
/**
 * Check if any member of the first set is also a member
 * of the second set.
 *
 * @param {Set<number>|Array<number>} a
 * @param {Set<number>|Array<number>} b
 * @returns {boolean}
 * @private
 */
export function anyMatch(a: Set<number> | Array<number>, b: Set<number> | Array<number>): boolean;
/**
 * Make everything an array.
 *
 * @template T
 * @param {T|T[]} maybeArray
 * @returns {T[]}
 * @private
 */
export function ensureArray<T>(maybeArray: T | T[]): T[];
/**
 * Ensures `message.from` is base58 encoded
 *
 * @template {{from?:any}} T
 * @param {T & IMessage} message
 * @param {string} [peerId]
 * @returns {NormalizedIMessage}
 */
export function normalizeInRpcMessage<T extends {
    from?: any;
}>(message: T & import("./message/rpc").RPC.IMessage, peerId?: string | undefined): NormalizedIMessage;
/**
 * @template {{from?:any, data?:any}} T
 *
 * @param {T & NormalizedIMessage} message
 * @returns {Message}
 */
export function normalizeOutRpcMessage<T extends {
    from?: any;
    data?: any;
}>(message: T & import(".").InMessage): Message;
//# sourceMappingURL=utils.d.ts.map
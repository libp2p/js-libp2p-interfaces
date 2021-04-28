export type InMessage = import('..').InMessage;
export type PublicKey = import('libp2p-crypto').PublicKey;
/**
 * Returns the PublicKey associated with the given message.
 * If no, valid PublicKey can be retrieved an error will be returned.
 *
 * @param {InMessage} message
 * @returns {Promise<PublicKey>}
 */
export function messagePublicKey(message: InMessage): Promise<PublicKey>;
/**
 * @typedef {import('..').InMessage}
 */
/**
 * Signs the provided message with the given `peerId`
 *
 * @param {PeerId} peerId
 * @param {RPC.Message} message
 * @returns {Promise<any>}
 */
export function signMessage(peerId: PeerId, message: RPC.Message): Promise<any>;
export type signMessage = import('..').InMessage;
export const SignPrefix: Uint8Array;
/**
 * Verifies the signature of the given message
 *
 * @param {InMessage} message
 * @returns {Promise<boolean>}
 */
export function verifySignature(message: InMessage): Promise<boolean>;
import PeerId = require("peer-id");
import { RPC } from "./rpc";
//# sourceMappingURL=sign.d.ts.map
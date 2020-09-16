/**
 * Returns the PublicKey associated with the given message.
 * If no, valid PublicKey can be retrieved an error will be returned.
 *
 * @param {InMessage} message
 * @returns {Promise<PublicKey>}
 */
export function messagePublicKey(message: any): Promise<any>;
/**
 * Signs the provided message with the given `peerId`
 *
 * @param {PeerId} peerId
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export function signMessage(peerId: import("peer-id"), message: any): Promise<any>;
export const SignPrefix: any;
/**
 * Verifies the signature of the given message
 * @param {InMessage} message
 * @returns {Promise<Boolean>}
 */
export function verifySignature(message: any): Promise<boolean>;

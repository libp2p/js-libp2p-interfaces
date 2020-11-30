export function randomSeqno(): Uint8Array;
export function msgId(from: string, seqno: Uint8Array): Uint8Array;
export function noSignMsgId(data: Uint8Array): Uint8Array;
export function anyMatch(a: Set<any> | any[], b: Set<any> | any[]): boolean;
export function ensureArray(maybeArray: any): any[];
export function normalizeInRpcMessage(message: object, peerId: string): object;
export function normalizeOutRpcMessage(message: object): object;

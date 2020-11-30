export function randomSeqno(): Uint8Array;
export function msgId(from: string, seqno: Uint8Array): Uint8Array;
export function noSignMsgId(data: Uint8Array): Uint8Array;
export function anyMatch(a: Set<any> | any[], b: Set<any> | any[]): boolean;
export function ensureArray<T>(maybeArray: T | T[]): T[];
export function normalizeInRpcMessage<T extends unknown>(message: T, peerId?: string): T & {
    from?: string;
    peerId?: string;
};
export function normalizeOutRpcMessage<T extends unknown>(message: T): T & {
    from?: Uint8Array;
    data?: Uint8Array;
};

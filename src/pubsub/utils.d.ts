export function randomSeqno(): Uint8Array;
export function msgId(from: string, seqno: Uint8Array): Uint8Array;
export function noSignMsgId(data: Uint8Array): Uint8Array;
export function anyMatch(a: Set<any> | any[], b: Set<any> | any[]): boolean;
export function ensureArray<T>(maybeArray: T | T[]): T[];
export function normalizeInRpcMessage<T extends Object>(message: T, peerId?: string | undefined): T & {
    from?: string | undefined;
    peerId?: string | undefined;
};
export function normalizeOutRpcMessage<T extends Object>(message: T): T & {
    from?: Uint8Array | undefined;
    data?: Uint8Array | undefined;
};

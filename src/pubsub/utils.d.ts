export function randomSeqno(): Uint8Array;
export function msgId(from: string, seqno: Uint8Array): string;
export function anyMatch(a: any[] | Set<any>, b: any[] | Set<any>): boolean;
export function ensureArray(maybeArray: any): any[];
export function normalizeInRpcMessage(message: any, peerId: string): any;
export function normalizeOutRpcMessage(message: any): any;

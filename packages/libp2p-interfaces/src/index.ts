
export interface AbortOptions {
  signal?: AbortSignal
}

// Borrowed from the tsdef module
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer I> ? Array<RecursivePartial<I>> : T[P] extends (...args: any[]) => any ? T[P] : RecursivePartial<T[P]>
}

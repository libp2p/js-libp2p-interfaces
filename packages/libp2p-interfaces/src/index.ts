
export interface AbortOptions {
  signal?: AbortSignal
}

export interface Startable {
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
  isStarted: () => boolean
}

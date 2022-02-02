
export interface AbortOptions {
  signal?: AbortSignal
}

export interface Startable {
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
  isStarted: () => boolean
}

export interface Logger {
  (...opts: any[]): void
  error: (...opts: any[]) => void
}

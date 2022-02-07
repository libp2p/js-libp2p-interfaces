import debug from 'debug'

export interface Logger {
  (formatter: any, ...args: any[]): void
  error: (formatter: any, ...args: any[]) => void
  enabled: boolean
}

export function logger (name: string): Logger {
  return Object.assign(debug(name), {
    error: debug(`${name}:error`)
  })
}

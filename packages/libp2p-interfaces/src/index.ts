import type { PeerId } from './peer-id/index.js'
import type { Multiaddr } from '@multiformats/multiaddr'
import type { Duplex } from 'it-stream-types'

export interface AbortOptions {
  signal?: AbortSignal
}

export interface Startable {
  start: () => void | Promise<void>
  stop: () => void | Promise<void>
  isStarted: () => boolean
}

// Implemented by libp2p, should be moved to libp2p-interfaces eventually
export interface Dialer {
  dialProtocol: (peer: PeerId, protocol: string, options?: { signal?: AbortSignal }) => Promise<{ stream: Duplex<Uint8Array> }>
}

// Implemented by libp2p, should be moved to libp2p-interfaces eventually
export interface Addressable {
  multiaddrs: Multiaddr[]
}

interface EventCallback<EventType> { (evt: EventType): void }
type EventHandler<EventType> = EventCallback<EventType> | ({ handleEvent: EventCallback<EventType> }) | null

/**
 * Adds types to the EventTarget class. Hopefully this won't be necessary forever.
 *
 * https://github.com/microsoft/TypeScript/issues/28357
 * https://github.com/microsoft/TypeScript/issues/43477
 * https://github.com/microsoft/TypeScript/issues/299
 * etc
 */
export class EventEmitter<EventMap> extends EventTarget {
  #listeners: Map<any, number> = new Map()

  listenerCount (type: string) {
    return this.#listeners.get(type) ?? 0
  }

  // @ts-expect-error EventTarget is not typed
  addEventListener<U extends keyof EventMap> (type: U, callback: EventHandler<EventMap[U]>, options?: AddEventListenerOptions | boolean) {
    // @ts-expect-error EventTarget is not typed
    super.addEventListener(type, callback)

    const count = this.#listeners.get(type) ?? 0

    this.#listeners.set(type, count + 1)
  }

  // @ts-expect-error EventTarget is not typed
  removeEventListener<U extends keyof EventMap> (type: U, callback: EventHandler<EventMap[U]> | undefined, options?: EventListenerOptions | boolean) {
    // @ts-expect-error EventTarget is not typed
    super.removeEventListener(type, callback)

    const count = this.#listeners.get(type) ?? 0

    if (count === 1) {
      this.#listeners.delete(type)
    } else {
      this.#listeners.set(type, count - 1)
    }
  }
}

/**
 * CustomEvent is a standard event but it's not supported by node.
 *
 * Remove this when https://github.com/nodejs/node/issues/40678 is closed.
 *
 * Ref: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
 */
class CustomEventPolyfill<T = any> extends Event {
  /** Returns any custom data event was created with. Typically used for synthetic events. */
  public detail: T

  constructor (message: string, data?: EventInit & { detail: T }) {
    super(message, data)
    // @ts-expect-error could be undefined
    this.detail = data?.detail
  }
}

export const CustomEvent = globalThis.CustomEvent ?? CustomEventPolyfill

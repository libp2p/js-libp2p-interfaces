import type { PeerId } from '@libp2p/interfaces/peer-id'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * We can't use PeerIds as map keys because map keys are
 * compared using same-value-zero equality, so this is just
 * a map that stringifies the PeerIds before storing them.
 *
 * PeerIds cache stringified versions of themselves so this
 * should be a cheap operation.
 */
export class PeerMap <T> {
  private readonly peers: Map<string, T>

  constructor (map?: Map<PeerId, T>) {
    this.peers = map ?? new Map()
  }

  has (peer: PeerId): boolean {
    return this.peers.has(peer.toString())
  }

  set (peer: PeerId, value: T) {
    this.peers.set(peer.toString(), value)
  }

  get (peer: PeerId): T | undefined {
    return this.peers.get(peer.toString())
  }

  clear () {
    this.peers.clear()
  }

  delete (peer: PeerId) {
    this.peers.delete(peer.toString())
  }

  get size () {
    return this.peers.size
  }

  keys (): IterableIterator<PeerId> {
    const keys = this.peers.keys()

    const iterator = {
      [Symbol.iterator]: () => {
        return iterator
      },
      next: () => {
        const val = keys.next()
        const id = val.value

        if (val.done === true || id == null) {
          const result: IteratorReturnResult<any> = {
            done: true,
            value: undefined
          }

          return result
        }

        return {
          done: false,
          value: peerIdFromString(id)
        }
      }
    }

    return iterator
  }

  values () {
    return this.peers.values()
  }
}

export function peerMap <T> (map?: Map<PeerId, T>): PeerMap<T> {
  return new PeerMap(map)
}

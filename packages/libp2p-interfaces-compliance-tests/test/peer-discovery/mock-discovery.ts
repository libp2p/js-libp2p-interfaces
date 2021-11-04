import { EventEmitter } from 'events'
import { Multiaddr } from 'multiaddr'
import PeerIdFactory from 'peer-id'

interface MockDiscoveryOptions {
  discoveryDelay?: number
}

/**
 * Emits 'peer' events on discovery.
 */
export class MockDiscovery extends EventEmitter {
  public readonly options: MockDiscoveryOptions
  private _isRunning: boolean
  private _timer: any

  constructor (options = {}) {
    super()

    this.options = options
    this._isRunning = false
  }

  start () {
    this._isRunning = true
    this._discoverPeer()
  }

  stop () {
    clearTimeout(this._timer)
    this._isRunning = false
  }

  _discoverPeer () {
    if (!this._isRunning) return

    PeerIdFactory.create({ bits: 512 })
      .then(peerId => {
        this._timer = setTimeout(() => {
          this.emit('peer', {
            id: peerId,
            multiaddrs: [new Multiaddr('/ip4/127.0.0.1/tcp/8000')]
          })
        }, this.options.discoveryDelay ?? 1000)
      })
      .catch(() => {})
  }
}

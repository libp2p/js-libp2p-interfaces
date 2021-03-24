import events from 'events';

declare class PeerDiscovery extends events.EventEmitter {
  constructor (options: Object);
  start (): Promise<void>;
  stop (): Promise<void>;
  tag: string;
}

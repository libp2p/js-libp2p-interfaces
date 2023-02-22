import { pEvent } from 'p-event'
import pWaitFor from 'p-wait-for'
import type { PubSub, SubscriptionChangeData } from '@libp2p/interface-pubsub'
import type { PeerId } from '@libp2p/interface-peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { mockConnectionManager, mockRegistrar, mockNetwork } from '@libp2p/interface-mocks'
import type { MockNetworkComponents } from '@libp2p/interface-mocks'

export async function waitForSubscriptionUpdate (a: PubSub, b: PeerId): Promise<void> {
  await pWaitFor(async () => {
    const event = await pEvent<'subscription-change', CustomEvent<SubscriptionChangeData>>(a, 'subscription-change')

    return event.detail.peerId.equals(b)
  })
}

export async function createComponents (): Promise<MockNetworkComponents> {
  const components: any = {
    peerId: await createEd25519PeerId(),
    registrar: mockRegistrar()
  }

  const config: any = {
     maxConnections: 10,
     minConnections: 10
  }

  components.connectionManager = mockConnectionManager(components, config)

  mockNetwork.addNode(components)

  return components
}

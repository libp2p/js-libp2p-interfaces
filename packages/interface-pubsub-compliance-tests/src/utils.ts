import { pEvent } from 'p-event'
import pWaitFor from 'p-wait-for'
import type { PubSub, SubscriptionChangeData } from '@libp2p/interface-pubsub'
import type { PeerId } from '@libp2p/interface-peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { mockConnectionManager, mockRegistrar, mockNetwork } from '@libp2p/interface-mocks'
import type { MockNetworkComponents } from '@libp2p/interface-mocks'

export async function waitForSubscriptionUpdate (a: PubSub, b: PeerId) {
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
  components.connectionManager = mockConnectionManager(components)

  mockNetwork.addNode(components)

  return components
}

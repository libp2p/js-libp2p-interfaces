import { pEvent } from 'p-event'
import pWaitFor from 'p-wait-for'
import type { SubscriptionChangeData } from '@libp2p/interfaces/pubsub'
import type { PubSubBaseProtocol } from '@libp2p/pubsub'

export async function waitForSubscriptionUpdate (a: PubSubBaseProtocol, b: PubSubBaseProtocol) {
  await pWaitFor(async () => {
    const event = await pEvent<'pubsub:subscription-change', CustomEvent<SubscriptionChangeData>>(a, 'pubsub:subscription-change')

    return event.detail.peerId.equals(b.components.getPeerId())
  })
}

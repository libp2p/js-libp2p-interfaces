import { pEvent } from 'p-event'
import pWaitFor from 'p-wait-for'
import type { PubSub, SubscriptionChangeData } from '@libp2p/interfaces/pubsub'
import type { PeerId } from '@libp2p/interfaces/peer-id'

export async function waitForSubscriptionUpdate (a: PubSub, b: PeerId) {
  await pWaitFor(async () => {
    const event = await pEvent<'subscription-change', CustomEvent<SubscriptionChangeData>>(a, 'subscription-change')

    return event.detail.peerId.equals(b)
  })
}

import { pEvent } from 'p-event'
import pWaitFor from 'p-wait-for'
import type { SubscriptionChangeData } from '@libp2p/interfaces/src/pubsub'
import type { PubsubBaseProtocol } from '@libp2p/pubsub'

export async function waitForSubscriptionUpdate (a: PubsubBaseProtocol, b: PubsubBaseProtocol) {
  await pWaitFor(async () => {
    const event = await pEvent<'pubsub:subscription-change', CustomEvent<SubscriptionChangeData>>(a, 'pubsub:subscription-change')

    return event.detail.peerId.equals(b.peerId)
  })
}

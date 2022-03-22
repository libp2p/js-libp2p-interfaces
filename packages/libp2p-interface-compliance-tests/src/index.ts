import type { Startable } from '@libp2p/interfaces'

export interface TestSetup<T, SetupArgs = {}> {
  setup: (args?: SetupArgs) => Promise<T>
  teardown: () => Promise<void>
}

export async function start (...startables: Startable[]) {
  await Promise.all(
    startables.map(async s => {
      if (s.beforeStart != null) {
        await s.beforeStart()
      }
    })
  )

  await Promise.all(
    startables.map(async s => {
      await s.start()
    })
  )

  await Promise.all(
    startables.map(async s => {
      if (s.afterStart != null) {
        await s.afterStart()
      }
    })
  )
}

export async function stop (...startables: Startable[]) {
  await Promise.all(
    startables.map(async s => {
      if (s.beforeStop != null) {
        await s.beforeStop()
      }
    })
  )

  await Promise.all(
    startables.map(async s => {
      await s.stop()
    })
  )

  await Promise.all(
    startables.map(async s => {
      if (s.afterStop != null) {
        await s.afterStop()
      }
    })
  )
}

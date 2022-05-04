import { isStartable, Startable } from '@libp2p/interfaces/startable'

export interface TestSetup<T, SetupArgs = {}> {
  setup: (args?: SetupArgs) => Promise<T>
  teardown: () => Promise<void>
}

export async function start (...objs: any[]) {
  const startables: Startable[] = []

  for (const obj of objs) {
    if (isStartable(obj)) {
      startables.push(obj)
    }
  }

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

export async function stop (...objs: any[]) {
  const startables: Startable[] = []

  for (const obj of objs) {
    if (isStartable(obj)) {
      startables.push(obj)
    }
  }

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


export interface TestSetup<T, SetupArgs = {}> {
  setup: (args?: SetupArgs) => Promise<T>
  teardown: () => Promise<void>
}

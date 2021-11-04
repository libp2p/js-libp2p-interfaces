import { expect } from 'aegir/utils/chai.js'

export function first <V> (map: Map<any, V>): V {
  return map.values().next().value
}

export function expectSet <T> (set?: Set<T>, subs?: T[]) {
  if ((set == null) || (subs == null)) {
    throw new Error('No set or subs passed')
  }

  expect(Array.from(set.values())).to.eql(subs)
}

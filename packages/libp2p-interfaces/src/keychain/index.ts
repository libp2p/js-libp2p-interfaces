import type { Multibase } from 'multiformats/bases/interface'

export interface KeyInfo {
  /**
   * The universally unique key id
   */
  id: string

  /**
   * The local key name
   */
  name: string
}

export type KeyType = 'Ed25519' | 'RSA'

export interface KeyChain {
  exportKey: (name: string, password: string) => Promise<Multibase<'m'>>
  importKey: (name: string, pem: string, password: string) => Promise<KeyInfo>

  createKey: (name: string, type: KeyType, size?: number) => Promise<KeyInfo>
  listKeys: () => Promise<KeyInfo[]>
  removeKey: (name: string) => Promise<KeyInfo>
  renameKey: (oldName: string, newName: string) => Promise<KeyInfo>

  findKeyById: (id: string) => Promise<KeyInfo>
  findKeyByName: (name: string) => Promise<KeyInfo>
}

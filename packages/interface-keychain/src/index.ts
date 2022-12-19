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
  /**
   * Export an existing key as a PEM encrypted PKCS #8 string.
   *
   * ```js
   * await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const pemKey = await libp2p.keychain.exportKey('keyTest', 'password123')
   * ```
   */
  exportKey: (name: string, password: string) => Promise<Multibase<'m'>>

  /**
   * Import a new key from a PEM encoded PKCS #8 string.
   *
   * ```js
   * await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const pemKey = await libp2p.keychain.exportKey('keyTest', 'password123')
   * const keyInfo = await libp2p.keychain.importKey('keyTestImport', pemKey, 'password123')
   * ```
   */
  importKey: (name: string, pem: string, password: string) => Promise<KeyInfo>

  /**
   * Create a key in the keychain.
   *
   * @example
   *
   * ```js
   * const keyInfo = await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * ```
   */
  createKey: (name: string, type: KeyType, size?: number) => Promise<KeyInfo>

  /**
   * List all the keys.
   *
   * @example
   *
   * ```js
   * const keyInfos = await libp2p.keychain.listKeys()
   * ```
   */
  listKeys: () => Promise<KeyInfo[]>

  /**
   * Removes a key from the keychain.
   *
   * @example
   *
   * ```js
   * await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const keyInfo = await libp2p.keychain.removeKey('keyTest')
   * ```
   */
  removeKey: (name: string) => Promise<KeyInfo>

  /**
   * Rename a key in the keychain.
   *
   * @example
   *
   * ```js
   * await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const keyInfo = await libp2p.keychain.renameKey('keyTest', 'keyNewNtest')
   * ```
   */
  renameKey: (oldName: string, newName: string) => Promise<KeyInfo>

  /**
   * Find a key by it's id.
   *
   * ```js
   * const keyInfo = await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const keyInfo2 = await libp2p.keychain.findKeyById(keyInfo.id)
   * ```
   */
  findKeyById: (id: string) => Promise<KeyInfo>

  /**
   * Find a key by it's name.
   *
   * @example
   *
   * ```js
   * const keyInfo = await libp2p.keychain.createKey('keyTest', 'rsa', 4096)
   * const keyInfo2 = await libp2p.keychain.findKeyByName('keyTest')
   * ```
   */
  findKeyByName: (name: string) => Promise<KeyInfo>
}

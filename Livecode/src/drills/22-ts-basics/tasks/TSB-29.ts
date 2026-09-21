import type { Equal, Expect } from '../../../shared/types'

// #region TSB-29 | Record из union | ★★☆
/**
 * Собрать объект, где ключ — каждая роль, а значение — boolean.
 */
type AppRole = 'admin' | 'user'

export type RoleFlags = AppRole

type _TSB29 = Expect<Equal<RoleFlags, { admin: boolean; user: boolean }>>
// #endregion

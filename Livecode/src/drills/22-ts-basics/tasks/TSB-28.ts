import type { Equal, Expect } from '../../../shared/types'

// #region TSB-28 | NonNullable | ★☆☆
/**
 * Убрать null и undefined из объединения.
 */
type Maybe = string | null | undefined

export type Sure = Maybe

type _TSB28 = Expect<Equal<Sure, string>>
// #endregion

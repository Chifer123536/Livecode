import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-21 | MyNonNullable | ★★☆
/** Аналог NonNullable<T>: убрать null и undefined. */
export type MyNonNullable<T> = T

type _TS21 = Expect<Equal<MyNonNullable<string | null | undefined>, string>>
// #endregion

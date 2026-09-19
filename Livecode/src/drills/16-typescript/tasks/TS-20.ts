import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-20 | MyExtract | ★★☆
/** Аналог Extract<T, U>: оставить только присваиваемое U. */
export type MyExtract<T, U> = T

type _TS20 = Expect<Equal<MyExtract<'a' | 'b' | 'c', 'a' | 'c' | 'z'>, 'a' | 'c'>>
// #endregion

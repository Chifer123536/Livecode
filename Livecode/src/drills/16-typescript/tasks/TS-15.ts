import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-15 | MyReadonly | ★★☆
/** Аналог Readonly<T>. */
export type MyReadonly<T> = T

type _TS15 = Expect<Equal<MyReadonly<{ a: number }>, { readonly a: number }>>
// #endregion

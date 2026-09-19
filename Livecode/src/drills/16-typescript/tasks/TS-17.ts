import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-17 | MyOmit | ★★★
/** Аналог Omit<T, K>. Подсказка: Pick + Exclude по keyof. */
export type MyOmit<T, K> = T

type _TS17 = Expect<Equal<MyOmit<{ a: number; b: string; c: boolean }, 'b'>, { a: number; c: boolean }>>
// #endregion

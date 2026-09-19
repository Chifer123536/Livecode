import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-14 | MyRequired | ★★☆
/** Аналог Required<T>: снять все знаки вопроса. Модификатор снимается через `-?`. */
export type MyRequired<T> = T

type _TS14 = Expect<Equal<MyRequired<{ a?: number; b?: string }>, { a: number; b: string }>>
// #endregion

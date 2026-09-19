import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-22 | MyReturnType | ★★★
/** Аналог ReturnType<F>. Подсказка: условный тип с `infer R`. */
export type MyReturnType<F> = F

type _TS22 = Expect<Equal<MyReturnType<() => number>, number>>
type _TS22b = Expect<Equal<MyReturnType<(a: string) => string[]>, string[]>>
// #endregion

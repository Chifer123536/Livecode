import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-19 | MyExclude | ★★☆
/**
 * Аналог Exclude<T, U>: выкинуть из объединения всё, что присваиваемо U.
 * Работает за счёт дистрибутивности условных типов по «голому» параметру.
 */
export type MyExclude<T, U> = T

type _TS19 = Expect<Equal<MyExclude<'a' | 'b' | 'c', 'b'>, 'a' | 'c'>>
// #endregion

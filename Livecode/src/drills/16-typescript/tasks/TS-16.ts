import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-16 | MyPick | ★★☆
/** Аналог Pick<T, K>. Ключи ограничить через `K extends keyof T`. */
export type MyPick<T, K> = T

type _TS16 = Expect<Equal<MyPick<{ a: number; b: string; c: boolean }, 'a' | 'c'>, { a: number; c: boolean }>>
// #endregion

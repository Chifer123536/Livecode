import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-13 | MyPartial | ★★☆
/** Аналог Partial<T>: все поля становятся необязательными. */
export type MyPartial<T> = T

type _TS13 = Expect<Equal<MyPartial<{ a: number; b: string }>, { a?: number; b?: string }>>
// #endregion

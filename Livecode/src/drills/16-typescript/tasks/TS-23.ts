import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-23 | MyParameters | ★★★
/** Аналог Parameters<F>: кортеж аргументов. Снова `infer`, но уже по списку параметров. */
export type MyParameters<F> = F

type _TS23 = Expect<Equal<MyParameters<(a: number, b: string) => void>, [a: number, b: string]>>
// #endregion

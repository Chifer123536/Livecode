import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-24 | UnwrapPromise | ★★★
/**
 * Развернуть Promise. Непромис вернуть как есть, вложенные промисы разворачивать рекурсивно.
 */
export type UnwrapPromise<T> = T

type _TS24 = Expect<Equal<UnwrapPromise<Promise<string>>, string>>
type _TS24b = Expect<Equal<UnwrapPromise<Promise<Promise<number>>>, number>>
type _TS24c = Expect<Equal<UnwrapPromise<boolean>, boolean>>
// #endregion

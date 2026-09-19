import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-25 | DeepReadonly | ★★★
/** Рекурсивный Readonly: заморозить объект на всех уровнях вложенности. */
export type DeepReadonly<T> = T

type _TS25 = Expect<
	Equal<DeepReadonly<{ a: number; b: { c: string } }>, { readonly a: number; readonly b: { readonly c: string } }>
>
// #endregion

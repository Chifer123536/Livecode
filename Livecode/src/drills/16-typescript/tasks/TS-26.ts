import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-26 | KeysOfType | ★★★
/**
 * Ключи, у которых значение имеет тип V.
 * Приём — «отображение с фильтром»: в отображённом типе положить K или never, затем взять [keyof T].
 */
export type KeysOfType<T, V> = keyof T

type _TS26 = Expect<Equal<KeysOfType<{ a: number; b: string; c: number }, number>, 'a' | 'c'>>
// #endregion

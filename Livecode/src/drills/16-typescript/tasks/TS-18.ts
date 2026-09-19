import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-18 | MyRecord | ★★☆
/** Аналог Record<K, V>. Ключи ограничить через `K extends string | number | symbol`. */
export type MyRecord<K, V> = K

type _TS18 = Expect<Equal<MyRecord<'a' | 'b', number>, { a: number; b: number }>>
// #endregion

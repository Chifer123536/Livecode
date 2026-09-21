import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-21 | Partial | ★☆☆
/**
 * Черновик поста: все поля необязательные.
 * Не переписывать поля руками — вывести тип из Post одной утилитой.
 */
export type Draft = Post

type _TSB21 = Expect<Equal<Draft, { id?: number; title?: string; body?: string }>>
// #endregion

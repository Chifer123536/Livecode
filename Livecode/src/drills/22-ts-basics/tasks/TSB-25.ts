import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-25 | Readonly | ★☆☆
/**
 * Запретить изменение всех полей поста.
 */
export type FrozenPost = Post

type _TSB25 = Expect<
	Equal<FrozenPost, { readonly id: number; readonly title: string; readonly body: string }>
>
// #endregion

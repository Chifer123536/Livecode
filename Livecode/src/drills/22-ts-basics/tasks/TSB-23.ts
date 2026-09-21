import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-23 | Omit | ★☆☆
/**
 * Пост перед отправкой на сервер: всё, кроме id — его выдаёт база.
 */
export type NewPost = Post

type _TSB23 = Expect<Equal<NewPost, { title: string; body: string }>>
// #endregion

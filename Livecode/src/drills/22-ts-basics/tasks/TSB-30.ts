import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-30 | keyof | ★★☆
/**
 * Получить объединение имён полей Post.
 */
export type PostKey = Post

type _TSB30 = Expect<Equal<PostKey, 'id' | 'title' | 'body'>>
// #endregion

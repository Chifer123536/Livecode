import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-24 | Required | ★☆☆
/**
 * У PostWithTags поле tags необязательное. Сделать все поля обязательными.
 */
export type FullPost = PostWithTags

type _TSB24 = Expect<Equal<FullPost, { id: number; title: string; tags: string[] }>>
// #endregion

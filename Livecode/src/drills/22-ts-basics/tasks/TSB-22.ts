import type { Equal, Expect } from '../../../shared/types'
import type { Post, PostWithTags } from './_types'

// #region TSB-22 | Pick | ★☆☆
/**
 * Превью поста: только id и title.
 */
export type Preview = Post

type _TSB22 = Expect<Equal<Preview, { id: number; title: string }>>
// #endregion

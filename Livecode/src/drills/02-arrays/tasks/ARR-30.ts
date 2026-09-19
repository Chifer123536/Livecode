import { todo } from '../../../shared/kit'

// #region ARR-30 | Собрать все теги | ★★☆
/**
 * Из списка постов собрать плоский список уникальных тегов, отсортированный по алфавиту.
 * Реальный кейс: построить фильтр по тегам из данных.
 *
 *   allTags([{ tags: ['b', 'a'] }, { tags: ['a', 'c'] }]) → ['a', 'b', 'c']
 */
export const allTags = (posts: Array<{ tags: string[] }>): string[] => todo()
// #endregion

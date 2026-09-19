import { todo } from '../../../shared/kit'

// #region ARR-25 | Заменить по индексу | ★★☆
/**
 * Заменить элемент по индексу без мутации.
 * Это буквально то, что пишут в React-редьюсерах каждый день.
 *
 *   replaceAt([1, 2, 3], 1, 9) → [1, 9, 3]
 */
export const replaceAt = <T>(list: T[], index: number, item: T): T[] => todo()
// #endregion

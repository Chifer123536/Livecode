import { todo } from '../../../shared/kit'

// #region ARR-24 | Удалить по индексу | ★★☆
/**
 * Удалить элемент по индексу без мутации. Неверный индекс — вернуть копию как есть.
 *
 *   removeAt([1, 2, 3], 1) → [1, 3]
 *   removeAt([1, 2], 9)    → [1, 2]
 */
export const removeAt = <T>(list: T[], index: number): T[] => todo()
// #endregion

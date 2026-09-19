import { todo } from '../../../shared/kit'

// #region ARR-23 | Вставить по индексу | ★★☆
/**
 * Вставить элемент на позицию index, НЕ мутируя исходный массив.
 * Индекс за границами зажимается в [0, list.length].
 *
 * Примеры:
 *   insertAt([1, 2, 3], 1, 9) → [1, 9, 2, 3]
 *   insertAt([1, 2], 99, 9)   → [1, 2, 9]
 */
export const insertAt = <T>(list: T[], index: number, item: T): T[] => todo()
// #endregion

import { todo } from '../../../shared/kit'

// #region ARR-27 | Переставить элемент | ★★★
/**
 * Перенести элемент с позиции from на позицию to. Без мутации.
 * Реальный кейс: drag & drop в списке задач.
 *
 * Примеры:
 *   moveItem(['a', 'b', 'c'], 0, 2) → ['b', 'c', 'a']
 *   moveItem(['a', 'b', 'c'], 2, 0) → ['c', 'a', 'b']
 */
export const moveItem = <T>(list: T[], from: number, to: number): T[] => todo()
// #endregion

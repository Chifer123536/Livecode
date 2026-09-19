import { todo } from '../../../shared/kit'

// #region ARR-26 | Переключить элемент | ★★☆
/**
 * Если элемент есть — убрать, если нет — добавить в конец. Без мутации.
 * Реальный кейс: выбор чекбоксов в фильтрах каталога.
 *
 * Примеры:
 *   toggleItem([1, 2], 2) → [1]
 *   toggleItem([1, 2], 3) → [1, 2, 3]
 */
export const toggleItem = <T>(list: T[], item: T): T[] => todo()
// #endregion

import { todo } from '../../../shared/kit'
import type { SortDirection } from './_pack'

// #region DAT-23 | Переключение сортировки | ★★☆
/**
 * Примеры:
 * Состояние заголовка таблицы: клик по тому же полю — asc → desc → выключено,
 * клик по другому — asc по нему.
 *
 *   toggleSort(null, 'price')                         → { key: 'price', direction: 'asc' }
 *   toggleSort({ key: 'price', direction: 'asc' }, 'price')  → { key: 'price', direction: 'desc' }
 *   toggleSort({ key: 'price', direction: 'desc' }, 'price') → null
 */
export type SortState = { key: string; direction: SortDirection } | null
export const toggleSort = (state: SortState, key: string): SortState => todo()
// #endregion

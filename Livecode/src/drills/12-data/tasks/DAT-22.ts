import { todo } from '../../../shared/kit'
import type { SortDirection } from './_pack'

// #region DAT-22 | Закреплённые наверху | ★★☆
/**
 * Отсортировать, но сначала показать закреплённые (по списку id), сохранив их взаимный порядок
 * из pinnedIds.
 */
export const sortWithPinned = <T extends { id: number }>(
	items: T[],
	pinnedIds: number[],
	key: keyof T,
	direction?: SortDirection
): T[] => todo()
// #endregion

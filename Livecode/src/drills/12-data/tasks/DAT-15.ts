import { todo } from '../../../shared/kit'

// #region DAT-15 | Вставить или обновить | ★★☆
/**
 * Есть элемент с таким id — заменить на месте (сохранив позицию), нет — добавить в конец.
 * Исходный массив не трогать.
 */
export const upsertById = <T extends { id: number }>(items: T[], item: T): T[] => todo()
// #endregion

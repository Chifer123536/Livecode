import { todo } from '../../../shared/kit'

// #region DAT-12 | Нормализация | ★★☆
/**
 * Список в форму, в которой его держат в сторе: справочник плюс порядок.
 *
 *   normalize([{ id: 2, ... }, { id: 5, ... }])
 *
 * Примеры:
 *     → { byId: { 2: {...}, 5: {...} }, allIds: [2, 5] }
 */
export type Normalized<T> = { byId: Record<string, T>; allIds: number[] }
export const normalize = <T extends { id: number }>(items: T[]): Normalized<T> => todo()
// #endregion

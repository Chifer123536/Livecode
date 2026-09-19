import { todo } from '../../../shared/kit'

// #region OBJ-12 | Нормализация | ★★☆
/**
 * Превратить список в { byId, allIds } — стандартная форма хранения данных в Redux.
 * Зачем: доступ по id за O(1) и отсутствие дублей одного объекта в разных местах.
 *
 *   normalize([{ id: 'a' }, { id: 'b' }]) → { byId: { a: {...}, b: {...} }, allIds: ['a', 'b'] }
 */
export type Normalized<T> = { byId: Record<string, T>; allIds: string[] }
export const normalize = <T extends { id: string }>(list: T[]): Normalized<T> => todo()
// #endregion

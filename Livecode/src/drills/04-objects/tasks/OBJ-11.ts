import { todo } from '../../../shared/kit'

// #region OBJ-11 | Список в словарь по id | ★☆☆
/**
 *   indexById([{ id: 'a', n: 1 }]) → { a: { id: 'a', n: 1 } }
 */
export const indexById = <T extends { id: string }>(list: T[]): Record<string, T> => todo()
// #endregion

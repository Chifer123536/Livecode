import { todo } from '../../../shared/kit'

// #region OBJ-04 | Преобразовать значения | ★☆☆
/**
 * Примеры:
 *   mapValues({ a: 1, b: 2 }, n => n * 10) → { a: 10, b: 20 }
 */
export const mapValues = <V, R>(obj: Record<string, V>, fn: (value: V, key: string) => R): Record<string, R> => todo()
// #endregion

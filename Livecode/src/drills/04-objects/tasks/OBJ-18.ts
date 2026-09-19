import { todo } from '../../../shared/kit'

// #region OBJ-18 | Есть ли путь | ★★☆
/**
 * Проверить наличие вложенного пути. Значение undefined по существующему ключу
 * всё равно считается наличием пути.
 *
 *   hasPath({ a: { b: undefined } }, 'a.b') → true
 *   hasPath({ a: {} }, 'a.b')               → false
 */
export const hasPath = (obj: unknown, path: string): boolean => todo()
// #endregion

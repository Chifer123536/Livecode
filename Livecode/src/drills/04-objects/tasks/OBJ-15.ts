import { todo } from '../../../shared/kit'

// #region OBJ-15 | Убрать пустые значения | ★★☆
/**
 * Выкинуть ключи со значениями undefined, null и ''. Ноль и false остаются.
 *
 * Примеры:
 *   removeEmpty({ a: 1, b: null, c: '', d: 0, e: false }) → { a: 1, d: 0, e: false }
 *
 * Практика: сборка параметров запроса.
 */
export const removeEmpty = <V>(obj: Record<string, V>): Record<string, V> => todo()
// #endregion

import { todo } from '../../../shared/kit'

// #region OBJ-10 | Значения по умолчанию | ★★☆
/**
 * Подставить дефолты там, где ключа нет или значение undefined.
 * Значения null, 0, '' и false считаются заданными и НЕ подменяются.
 *
 *   withDefaults({ a: 0 }, { a: 9, b: 2 }) → { a: 0, b: 2 }
 */
export const withDefaults = <T extends object>(obj: Partial<T>, defaults: T): T => todo()
// #endregion

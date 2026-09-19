import { todo } from '../../../shared/kit'

// #region OBJ-01 | Взять ключи | ★☆☆
/**
 * Примеры:
 *   pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) → { a: 1, c: 3 }
 * Несуществующий ключ просто пропускается.
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Partial<T> => todo()
// #endregion

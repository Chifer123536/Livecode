import { todo } from '../../../shared/kit'

// #region OBJ-02 | Убрать ключи | ★☆☆
/**
 *   omit({ a: 1, b: 2 }, ['b']) → { a: 1 }
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Partial<T> => todo()
// #endregion

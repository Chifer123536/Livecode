import { todo } from '../../../shared/kit'

// #region OBJ-05 | Преобразовать ключи | ★★☆
/**
 *   mapKeys({ a: 1 }, key => key.toUpperCase()) → { A: 1 }
 */
export const mapKeys = <V>(obj: Record<string, V>, fn: (key: string, value: V) => string): Record<string, V> => todo()
// #endregion

import { todo } from '../../../shared/kit'

// #region OBJ-24 | Отсортировать ключи | ★★☆
/**
 * Вернуть новый объект с ключами по алфавиту.
 * Полезно для стабильного JSON.stringify — например, как ключ кэша.
 *
 * Примеры:
 *   sortKeys({ b: 1, a: 2 }) → { a: 2, b: 1 }
 */
export const sortKeys = <V>(obj: Record<string, V>): Record<string, V> => todo()
// #endregion

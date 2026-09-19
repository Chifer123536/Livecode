import { todo } from '../../../shared/kit'

// #region OBJ-14 | Переименовать ключи | ★★☆
/**
 * Переименовать по карте соответствий. Ключи, которых нет в карте, остаются как есть.
 *
 *   renameKeys({ user_name: 'Аня' }, { user_name: 'userName' }) → { userName: 'Аня' }
 */
export const renameKeys = <V>(obj: Record<string, V>, map: Record<string, string>): Record<string, V> => todo()
// #endregion

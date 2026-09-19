import { todo } from '../../../shared/kit'

// #region ASY-19 | Безопасный вызов | ★★☆
/**
 * Вернуть кортеж [error, data] вместо исключения — приём из Go.
 * Успех → [null, data]. Ошибка → [error, null].
 *
 *   const [error, user] = await safe(loadUser())
 */
export const safe = <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => todo()
// #endregion

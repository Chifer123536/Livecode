import { todo } from '../../../shared/kit'

// #region OBJ-20 | Что изменилось | ★★★
/**
 * Вернуть только те ключи, значения которых отличаются (сравнение поверхностное, Object.is).
 * Ключ, которого нет в next, в результат не попадает.
 *
 * Примеры:
 *   objectDiff({ a: 1, b: 2 }, { a: 1, b: 3 }) → { b: 3 }
 *
 * Практика: отправлять на сервер только изменённые поля формы.
 */
export const objectDiff = <T extends Record<string, unknown>>(prev: T, next: T): Partial<T> => todo()
// #endregion

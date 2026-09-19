import { todo } from '../../../shared/kit'

// #region OBJ-28 | Поверхностное сравнение | ★★☆
/**
 * Сравнить объекты на один уровень через Object.is.
 * Ровно это делает React.memo и useMemo при сравнении зависимостей.
 *
 * Примеры:
 *   shallowEqual({ a: 1 }, { a: 1 })         → true
 *   shallowEqual({ a: {} }, { a: {} })       → false  // разные ссылки
 */
export const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>): boolean => todo()
// #endregion

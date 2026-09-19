import { todo } from '../../../shared/kit'

// #region UTL-18 | classNames | ★★☆
/**
 * Собрать строку классов из чего угодно: строк, массивов, объектов вида { active: true }.
 * Falsy-значения пропускаются, дубликаты не убираются, порядок сохраняется.
 *
 * Примеры:
 *   cx('btn', ['big', null], { active: true, hidden: false }) → 'btn big active'
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, unknown>
export const cx = (...values: ClassValue[]): string => todo()
// #endregion

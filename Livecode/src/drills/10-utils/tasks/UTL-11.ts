import { todo } from '../../../shared/kit'

// #region UTL-11 | set по пути | ★★★
/**
 * Записать значение по пути, создавая недостающие уровни.
 * Число в пути создаёт массив, строка — объект. Исходный объект НЕ мутировать.
 *
 *   set({}, 'a.b[0].c', 1) → { a: { b: [{ c: 1 }] } }
 */
export const set = <T extends object>(obj: T, path: string, value: unknown): T => todo()
// #endregion

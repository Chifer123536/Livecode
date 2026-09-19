import { todo } from '../../../shared/kit'
import { memoize } from './UTL-05'

// #region UTL-06 | memoize по ссылке | ★★★
/**
 * Кэш для функции одного аргумента-объекта. Ключи не должны мешать сборщику мусора:
 * если объект больше никому не нужен, запись обязана исчезнуть вместе с ним.
 *
 * Подсказка: обычный Map держит ключ вечно.
 */
export const memoizeByRef = <T extends object, R>(fn: (arg: T) => R): ((arg: T) => R) => todo()
// #endregion

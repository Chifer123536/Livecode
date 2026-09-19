import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-02 | Ключи объекта | ★★☆
/**
 * Достать значение по ключу так, чтобы тип результата был точным,
 * а несуществующий ключ не компилировался.
 *
 *   getProp({ a: 1, b: 'x' }, 'b') → тип string
 */
export const getProp = <T extends object, K extends keyof T>(obj: T, key: K): T[K] => todo()
// #endregion

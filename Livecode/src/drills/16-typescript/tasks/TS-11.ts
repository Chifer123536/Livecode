import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-11 | Ограничение дженерика | ★★☆
/**
 * Сумма по числовому полю. Типизировать так, чтобы ключ можно было передать
 * ТОЛЬКО если значение по нему — число.
 *
 *   sumField([{ price: 10 }, { price: 5 }], 'price')  → 15
 *   sumField([{ title: 'a' }], 'title')               → ошибка компиляции
 */
export type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]
export const sumField = <T extends object, K extends NumericKeys<T>>(list: T[], key: K): number => todo()
// #endregion

import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TSB-06 | Тип объекта | ★☆☆
/**
 * Описать тип User: два строковых поля first и last. Затем склеить их через пробел.
 * Сейчас User это unknown — обращение к полям не скомпилируется, пока тип не написан.
 *
 * Примеры:
 *   fullName({ first: 'Ада', last: 'Лавлейс' }) → 'Ада Лавлейс'
 */
export type User = unknown

export const fullName = (user: User): string => todo()

type _TSB06 = Expect<Equal<User, { first: string; last: string }>>
// #endregion

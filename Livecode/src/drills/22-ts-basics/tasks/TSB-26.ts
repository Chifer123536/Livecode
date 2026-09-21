import type { Equal, Expect } from '../../../shared/types'

// #region TSB-26 | ReturnType | ★★☆
/**
 * Достать тип того, что возвращает функция makeUser, не описывая его руками.
 */
const makeUser = () => ({ name: 'Аня', age: 30 })

export type MadeUser = typeof makeUser

type _TSB26 = Expect<Equal<MadeUser, { name: string; age: number }>>
// #endregion

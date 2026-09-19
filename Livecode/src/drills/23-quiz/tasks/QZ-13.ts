import { todo } from '../../../shared/kit'

// #region QZ-13 | Возврат промиса из then | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   Promise.resolve()
 *     .then(() => { console.log('1'); return Promise.resolve() })
 *     .then(() => console.log('2'))
 *   Promise.resolve()
 *     .then(() => console.log('3'))
 *     .then(() => console.log('4'))
 *     .then(() => console.log('5'))
 */
export const qz13 = (): string[] => todo()
// #endregion

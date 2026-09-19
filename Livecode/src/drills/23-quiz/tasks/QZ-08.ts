import { todo } from '../../../shared/kit'

// #region QZ-08 | Микрозадача внутри таймера | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   setTimeout(() => {
 *     console.log('1')
 *     Promise.resolve().then(() => console.log('2'))
 *   }, 0)
 *   setTimeout(() => console.log('3'), 0)
 */
export const qz08 = (): string[] => todo()
// #endregion

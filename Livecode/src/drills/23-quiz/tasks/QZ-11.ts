import { todo } from '../../../shared/kit'

// #region QZ-11 | await в цикле | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   async function run() {
 *     for (const n of [1, 2]) {
 *       await null
 *       console.log(String(n))
 *     }
 *   }
 *   run()
 *   Promise.resolve().then(() => console.log('микро'))
 */
export const qz11 = (): string[] => todo()
// #endregion

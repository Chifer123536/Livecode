import { todo } from '../../../shared/kit'

// #region QZ-20 | try/catch/finally с return | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   function run() {
 *     try { console.log('try'); return 'из try' }
 *     finally { console.log('finally') }
 *   }
 *   console.log(run())
 */
export const qz20 = (): string[] => todo()
// #endregion

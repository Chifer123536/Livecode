import { todo } from '../../../shared/kit'

// #region QZ-20 | try/catch/finally с return | ★★★
/**
 *   function run() {
 *     try { console.log('try'); return 'из try' }
 *     finally { console.log('finally') }
 *   }
 *   console.log(run())
 */
export const qz20 = (): string[] => todo()
// #endregion

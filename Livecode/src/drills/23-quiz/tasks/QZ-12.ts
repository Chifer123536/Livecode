import { todo } from '../../../shared/kit'

// #region QZ-12 | Ошибка в then | ★★★
/**
 *   Promise.reject(new Error('бум'))
 *     .then(() => console.log('then'))
 *     .catch(() => console.log('catch'))
 *     .finally(() => console.log('finally'))
 */
export const qz12 = (): string[] => todo()
// #endregion

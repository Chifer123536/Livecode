import { todo } from '../../../shared/kit'

// #region QZ-12 | Ошибка в then | ★★★
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   Promise.reject(new Error('бум'))
 *     .then(() => console.log('then'))
 *     .catch(() => console.log('catch'))
 *     .finally(() => console.log('finally'))
 */
export const qz12 = (): string[] => todo()
// #endregion

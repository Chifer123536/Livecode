import { todo } from '../../../shared/kit'

// #region QZ-07 | queueMicrotask и then | ★★☆
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   queueMicrotask(() => console.log('1'))
 *   Promise.resolve().then(() => console.log('2'))
 *   queueMicrotask(() => console.log('3'))
 */
export const qz07 = (): string[] => todo()
// #endregion

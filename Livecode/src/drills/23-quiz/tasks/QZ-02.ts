import { todo } from '../../../shared/kit'

// #region QZ-02 | Исполнитель промиса синхронный | ★★☆
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   console.log('1')
 *   new Promise(resolve => { console.log('2'); resolve(undefined) }).then(() => console.log('3'))
 *   console.log('4')
 */
export const qz02 = (): string[] => todo()
// #endregion

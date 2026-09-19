import { todo } from '../../../shared/kit'

// #region QZ-18 | Замыкание в цикле с массивом функций | ★★☆
/**
 * Что напечатает код ниже и в каком порядке? Верни массив строк — по одной на каждый вывод.
 *
 *   const fns = []
 *   for (var i = 0; i < 3; i++) fns.push(() => i)
 *   console.log(fns.map(f => String(f())).join(','))
 */
export const qz18 = (): string[] => todo()
// #endregion

import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-06 | Дискриминированное объединение | ★★★
/**
 * Посчитать площадь фигуры. Сужение по полю kind, без as и без any.
 * Ветку default написать через `never`, чтобы добавление новой фигуры
 * ЛОМАЛО компиляцию, а не молча возвращало ноль.
 *
 * Примеры:
 *   area({ kind: 'circle', r: 2 })            → 12.566...
 *   area({ kind: 'rect', w: 2, h: 3 })        → 6
 *   area({ kind: 'square', size: 3 })         → 9
 */
export type Shape =
	| { kind: 'circle'; r: number }
	| { kind: 'rect'; w: number; h: number }
	| { kind: 'square'; size: number }

export const area = (shape: Shape): number => todo()
// #endregion

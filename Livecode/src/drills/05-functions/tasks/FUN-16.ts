import { todo } from '../../../shared/kit'

// #region FUN-16 | Потеря контекста | ★★☆
/**
 * Вернуть функцию, которая при вызове без контекста всё равно читает нужный объект.
 * Реализовать ДВУМЯ способами и оставить любой, но уметь назвать оба:
 * через bind и через стрелку-обёртку.
 *
 *   const read = detach(obj, 'getName')
 *   read() → значение obj.name, даже если вызвать read отдельно
 */
export const detach = <T extends object, K extends keyof T>(
	obj: T,
	method: K
): T[K] extends (...args: infer A) => infer R ? (...args: A) => R : never => todo()
// #endregion

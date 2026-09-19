import { todo } from '../../../shared/kit'

// #region ASY-18 | Промисификация колбэка | ★★☆
/**
 * Превратить функцию в стиле Node (последний аргумент — колбэк (err, result))
 * в функцию, возвращающую промис.
 *
 *   const read = promisify(fs.readFile)
 */
export type NodeStyle<T> = (arg: string, callback: (error: Error | null, result?: T) => void) => void
export const promisify = <T>(fn: NodeStyle<T>): ((arg: string) => Promise<T>) => todo()
// #endregion

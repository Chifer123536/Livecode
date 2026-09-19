import { todo } from '../../../shared/kit'

// #region ASY-17 | Очередь задач | ★★★
/**
 * Очередь, которая выполняет задачи строго по одной в порядке добавления.
 * add возвращает промис с результатом конкретной задачи.
 * Упавшая задача не должна останавливать очередь.
 */
export type Queue = { add: <T>(task: () => Promise<T>) => Promise<T>; size: () => number }
export const createQueue = (): Queue => todo()
// #endregion

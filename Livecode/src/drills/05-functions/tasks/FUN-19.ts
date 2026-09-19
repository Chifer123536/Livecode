import { todo } from '../../../shared/kit'

// #region FUN-19 | Накопитель | ★★★
/**
 * Функция копит аргументы, пока её вызывают с числом, и отдаёт сумму при вызове без аргументов.
 *
 *   const acc = accumulate()
 *   acc(1); acc(2); acc(3); acc() → 6
 */
export const accumulate = (): ((n?: number) => number | undefined) => todo()
// #endregion

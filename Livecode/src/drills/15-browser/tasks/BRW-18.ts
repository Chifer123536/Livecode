import { todo } from '../../../shared/kit'

// #region BRW-18 | Троттлинг кадрами | ★★★
/**
 * Для scroll и resize правильная частота — один раз на кадр, а не «раз в 16 мс».
 * Лишние вызовы внутри кадра отбрасываются, выполняется последний набор аргументов.
 * Есть метод cancel, снимающий запланированный кадр.
 */
export type RafThrottled<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void }
export const rafThrottle = <A extends unknown[]>(fn: (...args: A) => void): RafThrottled<A> => todo()
// #endregion

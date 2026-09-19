import { todo } from '../../../shared/kit'

// #region UTL-01 | debounce | ★★☆
/**
 * Схлопнуть частые вызовы в один: fn выполнится через delay мс после ПОСЛЕДНЕГО вызова.
 * Аргументы берутся от последнего вызова, this пробрасывается.
 * Возвращаемая функция имеет метод cancel().
 *
 * Практика: поиск при вводе, автосохранение, валидация на лету.
 */
export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void }
export const debounce = <A extends unknown[]>(fn: (...args: A) => void, delay: number): Debounced<A> => todo()
// #endregion

import { todo } from '../../../shared/kit'
import { debounce } from './UTL-01'

// #region UTL-02 | throttle | ★★☆
/**
 * Пропускать не чаще одного вызова в interval мс. Первый вызов проходит сразу.
 * Вызовы внутри окна отбрасываются.
 *
 * Практика: scroll, resize, mousemove, автодополнение по таймеру.
 * Разницу с debounce надо уметь объяснить одной фразой.
 */
export const throttle = <A extends unknown[]>(fn: (...args: A) => void, interval: number): ((...args: A) => void) =>
	todo()
// #endregion

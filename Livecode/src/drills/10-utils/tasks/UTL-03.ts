import { todo } from '../../../shared/kit'
import { throttle } from './UTL-02'

// #region UTL-03 | throttle с хвостом | ★★★
/**
 * Как throttle, но последний вызов из окна не теряется:
 * он выполняется в конце интервала с последними аргументами.
 *
 * Практика: прогресс загрузки — важно и не частить, и показать финальное значение.
 */
export const throttleTrailing = <A extends unknown[]>(
	fn: (...args: A) => void,
	interval: number
): ((...args: A) => void) => todo()
// #endregion

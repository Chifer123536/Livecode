import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-09 | useDebouncedCallback | ★★★
/**
 * Возвращает СТАБИЛЬНУЮ функцию, которая вызовет fn через delay мс после последнего вызова.
 * Аргументы берутся от последнего вызова. Таймер чистится при размонтировании.
 * Ссылка на возвращённую функцию не должна меняться между рендерами.
 */
export function useDebouncedCallback<A extends unknown[]>(
	fn: (...args: A) => void,
	delay: number
): (...args: A) => void {
	return todo()
}
// #endregion

import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-10 | useThrottledCallback | ★★★
/**
 * Стабильная функция, которая пропускает вызов не чаще раза в interval мс.
 * Первый вызов проходит сразу (leading edge), остальные внутри окна отбрасываются.
 */
export function useThrottledCallback<A extends unknown[]>(
	fn: (...args: A) => void,
	interval: number
): (...args: A) => void {
	return todo()
}
// #endregion

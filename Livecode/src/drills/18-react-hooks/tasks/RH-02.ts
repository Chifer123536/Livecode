import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-02 | useCounter | ★★☆
/**
 * Счётчик с необязательными границами. Выход за границы зажимается.
 * Возвращает { count, inc, dec, reset, set }.
 *
 *   const { count, inc } = useCounter(0, { min: 0, max: 10 })
 */
export type CounterApi = {
	count: number
	inc: () => void
	dec: () => void
	reset: () => void
	set: (next: number) => void
}
export function useCounter(initial = 0, bounds?: { min?: number; max?: number }): CounterApi {
	return todo()
}
// #endregion

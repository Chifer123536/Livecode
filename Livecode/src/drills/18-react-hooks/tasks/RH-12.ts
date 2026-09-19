import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-12 | useTimeout | ★★☆
/**
 * Однократный вызов callback через delay мс. delay === null — не запускать.
 * Возвращает { clear, restart }.
 */
export type TimeoutApi = { clear: () => void; restart: () => void }
export function useTimeout(callback: () => void, delay: number | null): TimeoutApi {
	return todo()
}
// #endregion

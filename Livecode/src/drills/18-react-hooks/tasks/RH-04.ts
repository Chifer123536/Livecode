import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-04 | usePrevious | ★★☆
/**
 * Значение с предыдущего рендера. До первого изменения — undefined.
 * Работает за счёт того, что эффект выполняется ПОСЛЕ рендера.
 */
export function usePrevious<T>(value: T): T | undefined {
	return todo()
}
// #endregion

import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-08 | useDebounce | ★★☆
/**
 * Отдаёт value, но обновляется только после delay мс тишины.
 *
 *   const debouncedQuery = useDebounce(query, 300)
 */
export function useDebounce<T>(value: T, delay: number): T {
	return todo()
}
// #endregion

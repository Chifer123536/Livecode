import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-07 | useLatest | ★★☆
/**
 * Ref, в котором ВСЕГДА лежит самое свежее значение.
 * Спасает от «устаревшего замыкания» в таймерах и подписках.
 */
export function useLatest<T>(value: T): RefObject<T> {
	return todo()
}
// #endregion

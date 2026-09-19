import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-19 | useWindowSize | ★★☆
/**
 * { width, height } окна с подпиской на resize.
 * Значение должно браться из window.innerWidth / innerHeight.
 */
export function useWindowSize(): { width: number; height: number } {
	return todo()
}
// #endregion

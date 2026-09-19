import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-14 | useClickOutside | ★★☆
/**
 * Вызывает handler, когда mousedown произошёл вне элемента ref.
 * Слушатель снимается в cleanup.
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void): void {
	return todo()
}
// #endregion

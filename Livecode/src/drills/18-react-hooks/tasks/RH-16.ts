import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-16 | useKeyPress | ★★☆
/**
 * Вызывает handler при нажатии конкретной клавиши (event.key).
 * Слушать keydown на document.
 *
 *   useKeyPress('Escape', close)
 */
export function useKeyPress(key: string, handler: (event: KeyboardEvent) => void): void {
	return todo()
}
// #endregion

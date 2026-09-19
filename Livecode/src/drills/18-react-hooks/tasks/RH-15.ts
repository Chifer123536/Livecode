import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-15 | useEventListener | ★★★
/**
 * Подписка на событие с автоматической отпиской.
 * Смена handler НЕ должна пересоздавать подписку — держи его в ref.
 * По умолчанию цель — window.
 */
export function useEventListener<E extends Event>(
	type: string,
	handler: (event: E) => void,
	target?: EventTarget | null
): void {
	return todo()
}
// #endregion

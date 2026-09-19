import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-18 | useOnlineStatus | ★★☆
/**
 * Есть ли сеть. Начальное значение — navigator.onLine,
 * дальше подписка на события window 'online' и 'offline'.
 */
export function useOnlineStatus(): boolean {
	return todo()
}
// #endregion

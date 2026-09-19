import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-17 | useMediaQuery | ★★★
/**
 * true, если медиазапрос сейчас выполняется. Подписаться на изменения и отписаться в cleanup.
 * Использовать window.matchMedia(query) и его addEventListener('change', ...).
 *
 *   const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
	return todo()
}
// #endregion

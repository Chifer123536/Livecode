import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-06 | useIsMounted | ★★☆
/**
 * Возвращает стабильную функцию, которая говорит, смонтирован ли компонент сейчас.
 * Нужна, чтобы не трогать состояние после размонтирования.
 *
 *   const isMounted = useIsMounted()
 *   if (isMounted()) setData(result)
 */
export function useIsMounted(): () => boolean {
	return todo()
}
// #endregion

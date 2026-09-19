import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-05 | useUpdateEffect | ★★☆
/**
 * Как useEffect, но НЕ срабатывает на первом рендере — только на обновлениях.
 * Реальный кейс: не дёргать поиск на монтировании, когда запрос ещё пустой.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
	return todo()
}
// #endregion

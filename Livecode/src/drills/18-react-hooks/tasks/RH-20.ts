import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-20 | useSelection | ★★★
/**
 * Множественный выбор из списка id.
 * Возвращает { selected, isSelected, toggle, selectAll, clear, allSelected }.
 * selected — массив в порядке исходного списка items, а не в порядке кликов.
 */
export type SelectionApi = {
	selected: string[]
	isSelected: (id: string) => boolean
	toggle: (id: string) => void
	selectAll: () => void
	clear: () => void
	allSelected: boolean
}
export function useSelection(items: string[]): SelectionApi {
	return todo()
}
// #endregion

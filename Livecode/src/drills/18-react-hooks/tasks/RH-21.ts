import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-21 | useStateWithHistory | ★★★
/**
 * Состояние с undo/redo.
 * Возвращает { value, set, undo, redo, canUndo, canRedo }.
 * После undo новый set обрезает «будущее» — как в любом редакторе.
 */
export type HistoryApi<T> = {
	value: T
	set: (next: T) => void
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean
}
export function useStateWithHistory<T>(initial: T): HistoryApi<T> {
	return todo()
}
// #endregion

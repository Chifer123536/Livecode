import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-22 | usePagination | ★★★
/**
 * Пагинация без данных, только арифметика.
 * Возвращает { page, totalPages, next, prev, go, hasNext, hasPrev, from, to }.
 * page нумеруется с единицы и зажимается в [1, totalPages]. totalPages минимум 1.
 * from/to — индексы среза: list.slice(from, to).
 */
export type PaginationApi = {
	page: number
	totalPages: number
	next: () => void
	prev: () => void
	go: (page: number) => void
	hasNext: boolean
	hasPrev: boolean
	from: number
	to: number
}
export function usePagination(totalItems: number, perPage: number): PaginationApi {
	return todo()
}
// #endregion

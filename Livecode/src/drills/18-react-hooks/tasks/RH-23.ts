import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-23 | useAsync | ★★★
/**
 * Обёртка над асинхронной функцией: { run, data, error, loading }.
 * run возвращает промис и не должен бросать наружу — ошибку класть в error.
 * Состояние не трогать после размонтирования.
 */
export type AsyncApi<T, A extends unknown[]> = {
	run: (...args: A) => Promise<void>
	data: T | null
	error: string | null
	loading: boolean
}
export function useAsync<T, A extends unknown[]>(fn: (...args: A) => Promise<T>): AsyncApi<T, A> {
	return todo()
}
// #endregion

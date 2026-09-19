import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-10 | Перегрузки | ★★★
/**
 * len(value) возвращает длину строки или массива.
 * Написать ДВЕ перегрузки, чтобы len('abc') и len([1,2]) оба давали number,
 * а len(42) не компилировался.
 */
export function len(value: string): number
export function len(value: unknown[]): number
export function len(value: string | unknown[]): number {
	return todo()
}
// #endregion

import { todo } from '../../../shared/kit'
import type { Equal, Expect } from '../../../shared/types'

// #region TS-08 | Result вместо исключений | ★★★
/**
 * Тип Result<T, E> — дискриминированное объединение успеха и ошибки.
 * ok(value) и err(error) — конструкторы, unwrapOr(result, fallback) — безопасное чтение.
 * После проверки result.ok === true поле value должно сужаться без приведения.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => todo()
export const err = <E>(error: E): Result<never, E> => todo()
export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T => todo()
// #endregion

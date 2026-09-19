import { todo } from '../../../shared/kit'

// #region API-19 | Перехватчики | ★★★
/**
 * Обернуть запрос хуками: onRequest может подменить параметры (например, подставить токен),
 * onResponse видит результат, onError — ошибку и может её подменить.
 * Хуки необязательные.
 */
export type Interceptors<A, R> = {
	onRequest?: (args: A) => A
	onResponse?: (result: R) => R
	onError?: (error: unknown) => never | R
}
export const withInterceptors = <A, R>(
	fn: (args: A) => Promise<R>,
	interceptors: Interceptors<A, R>
): ((args: A) => Promise<R>) => todo()
// #endregion

import { todo } from '../../../shared/kit'

// #region FUN-14 | Логирующая обёртка | ★★☆
/**
 * Вызвать log до и после выполнения, вернуть результат оригинала.
 * Формат сообщений: `вызов fnName` и `результат <значение>`.
 * Имя функции взять из fn.name.
 */
export const withLogging = <A extends unknown[], R>(
	fn: (...args: A) => R,
	log: (message: string) => void
): ((...args: A) => R) => todo()
// #endregion

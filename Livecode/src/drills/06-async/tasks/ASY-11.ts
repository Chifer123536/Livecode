import { todo } from '../../../shared/kit'

// #region ASY-11 | Повтор с ростом паузы | ★★★
/**
 * То же, но пауза удваивается: base, base*2, base*4...
 * Так делают все продовые клиенты, чтобы не добивать лежащий сервер.
 * onAttempt (если передан) вызывается перед каждой ПОВТОРНОЙ попыткой с номером паузы.
 */
export const retryBackoff = <T>(
	fn: () => Promise<T>,
	attempts: number,
	base: number,
	onAttempt?: (waitMs: number) => void
): Promise<T> => todo()
// #endregion

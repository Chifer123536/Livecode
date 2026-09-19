import { todo } from '../../../shared/kit'

// #region ASY-22 | Опрос до условия | ★★★
/**
 * Дёргать fn каждые intervalMs, пока результат не удовлетворит condition.
 * Не дождался за maxAttempts — отклониться с Error('опрос не дождался').
 * Реальный кейс: ждём, когда сервер дорисует отчёт.
 */
export const poll = <T>(
	fn: () => Promise<T>,
	condition: (value: T) => boolean,
	intervalMs: number,
	maxAttempts: number
): Promise<T> => todo()
// #endregion

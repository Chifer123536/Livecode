import { todo } from '../../../shared/kit'

// #region ASY-10 | Повтор при ошибке | ★★☆
/**
 * Повторять fn при отклонении. attempts — общее число попыток.
 * Между попытками пауза delayMs. Исчерпал попытки — пробросить ПОСЛЕДНЮЮ ошибку.
 */
export const retry = <T>(fn: () => Promise<T>, attempts: number, delayMs?: number): Promise<T> => todo()
// #endregion

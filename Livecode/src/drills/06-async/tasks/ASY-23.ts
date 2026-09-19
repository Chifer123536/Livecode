import { todo } from '../../../shared/kit'

// #region ASY-23 | Отменяемая обёртка | ★★★
/**
 * Обернуть промис так, чтобы результат можно было проигнорировать.
 * cancel() не останавливает сам промис (это невозможно), но гарантирует,
 * что обёртка никогда не зарезолвится и не отклонится.
 * Именно так до AbortController чинили гонки в React.
 */
export type Cancellable<T> = { promise: Promise<T>; cancel: () => void }
export const makeCancellable = <T>(promise: Promise<T>): Cancellable<T> => todo()
// #endregion

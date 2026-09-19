import { todo } from '../../../shared/kit'

// #region FUN-18 | Ленивое значение | ★★☆
/**
 * Вычислить при первом обращении и запомнить. Повторные обращения не пересчитывают,
 * даже если результат undefined.
 *
 *   const value = lazy(() => дорогоеВычисление())
 *   value(); value()  // вычисление произошло один раз
 */
export const lazy = <T>(factory: () => T): (() => T) => todo()
// #endregion

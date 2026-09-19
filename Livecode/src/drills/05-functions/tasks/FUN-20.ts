import { todo } from '../../../shared/kit'

// #region FUN-20 | Цепочка вызовов | ★★★
/**
 * Fluent-интерфейс: методы возвращают сам объект, value() завершает цепочку.
 *
 *   chain(5).add(3).multiply(2).value() → 16
 */
export type Chain = { add: (n: number) => Chain; multiply: (n: number) => Chain; value: () => number }
export const chain = (start: number): Chain => todo()
// #endregion

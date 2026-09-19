import { todo } from '../../../shared/kit'

// #region UTL-08 | deepEqual | ★★★
/**
 * Структурное сравнение. NaN равен NaN, 0 и -0 различаются (правило Object.is).
 * Массив и объект с теми же ключами не равны. Разное число ключей — не равны.
 */
export const deepEqual = (a: unknown, b: unknown): boolean => todo()
// #endregion

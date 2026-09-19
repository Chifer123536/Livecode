import { todo } from '../../../shared/kit'

// #region ALG-26 | Размен монетами | ★★★
/**
 * Минимальное число монет на сумму amount, -1 если не собрать.
 * Жадность здесь НЕ работает: на [1, 3, 4] и сумме 6 она даст 3 монеты вместо 2.
 * Динамика: dp[сумма] = 1 + минимум по всем номиналам.
 *
 * Примеры:
 *   coinChange([1, 3, 4], 6)  → 2
 *   coinChange([2], 3)        → -1
 *   coinChange([1, 2, 5], 0)  → 0
 */
export const coinChange = (coins: number[], amount: number): number => todo()
// #endregion

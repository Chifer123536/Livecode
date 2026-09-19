import { todo } from '../../../shared/kit'

// #region FUN-04 | Банковский счёт | ★★☆
/**
 * Баланс должен быть недоступен снаружи никак: ни через свойство, ни через Object.keys.
 *  - deposit не принимает неположительные суммы (возвращает false);
 *  - withdraw не уводит баланс в минус (возвращает false);
 *  - успешная операция возвращает true.
 *
 * Это канонический ответ на вопрос «как сделать приватное поле без классов».
 */
export type Account = {
	deposit: (amount: number) => boolean
	withdraw: (amount: number) => boolean
	getBalance: () => number
}
export const createAccount = (initial?: number): Account => todo()
// #endregion

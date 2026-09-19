import { todo } from '../../../shared/kit'

// #region ASY-08 | Свой Promise.any | ★★★
/**
 * Резолвится первым УСПЕШНЫМ. Если все упали — отклоняется ошибкой
 * с сообщением 'все промисы упали'.
 */
export const myAny = <T>(promises: Array<Promise<T>>): Promise<T> => todo()
// #endregion

import { todo } from '../../../shared/kit'
import { ApiError } from './API-06'

// #region API-07 | Обёртка над fetch | ★★★
/**
 * Главная функция пака:
 *  - не ok → бросить ApiError со статусом и телом ответа (если это JSON);
 *  - 204 и пустое тело → вернуть null;
 *  - иначе распарсить JSON.
 *
 * Сетевой сбой (fetch бросил) превратить в ApiError со статусом 0.
 */
export const fetchJson = <T>(url: string, options?: RequestInit): Promise<T> => todo()
// #endregion

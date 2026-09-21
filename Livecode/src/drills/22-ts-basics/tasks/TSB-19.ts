import { todo } from '../../../shared/kit'

// #region TSB-19 | Типы и async | ★★☆
/**
 * Дождаться строки от переданного загрузчика и вернуть её длину.
 * async-функция всегда возвращает Promise, поэтому в аннотации именно Promise<number>.
 *
 * Примеры:
 *   await fetchLength(async () => 'абв') → 3
 */
export const fetchLength = async (load: () => Promise<string>): Promise<number> => todo()
// #endregion

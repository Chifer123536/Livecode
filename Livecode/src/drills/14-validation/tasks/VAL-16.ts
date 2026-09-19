import { todo } from '../../../shared/kit'

// #region VAL-16 | Асинхронная проверка | ★★★
/**
 * Проверка занятости логина на сервере. Требования:
 *  - результат УСТАРЕВШЕГО вызова игнорируется: если во время запроса пришёл новый вызов,
 *    старый резолвится с null и ничего не записывает;
 *  - одинаковое значение подряд не перепроверяется — берётся прошлый результат.
 * check возвращает true, если логин свободен.
 */
export const createAsyncValidator = (
	check: (value: string) => Promise<boolean>,
	message: string
): ((value: string) => Promise<string | null>) => todo()
// #endregion

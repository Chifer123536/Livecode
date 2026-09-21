import { todo } from '../../../shared/kit'

// #region TSB-07 | readonly и необязательное поле | ★★☆
/**
 * Заполнить недостающие настройки значением по умолчанию: retries = 3.
 * Поле id помечено readonly — присвоить ему новое значение нельзя.
 * Возврат должен иметь retries обязательным числом, а не number | undefined.
 *
 * Примеры:
 *   withDefaults({ id: 'a' })             → { id: 'a', retries: 3 }
 *   withDefaults({ id: 'a', retries: 7 }) → { id: 'a', retries: 7 }
 */
export type Config = { readonly id: string; retries?: number }

export const withDefaults = (config: Config): { id: string; retries: number } => todo()
// #endregion

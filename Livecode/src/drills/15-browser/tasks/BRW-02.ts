import { todo } from '../../../shared/kit'

// #region BRW-02 | Обновить параметры | ★★★
/**
 * Вернуть новый адрес с изменёнными параметрами. null и undefined удаляют параметр,
 * остальные значения перезаписывают. Хэш и путь сохраняются.
 *
 *   updateQuery('https://a.ru/x?page=2&q=a', { page: 3, q: null }) → 'https://a.ru/x?page=3'
 */
export const updateQuery = (url: string, patch: Record<string, unknown>): string => todo()
// #endregion

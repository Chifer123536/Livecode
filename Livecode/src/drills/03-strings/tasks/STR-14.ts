import { todo } from '../../../shared/kit'

// #region STR-14 | Слаг из заголовка | ★★★
/**
 * Привести к нижнему регистру, транслитерировать кириллицу, убрать всё лишнее,
 * пробелы заменить на дефисы, повторные дефисы схлопнуть, крайние убрать.
 *
 * Примеры:
 *   slugify('Привет, Мир!')         → 'privet-mir'
 *   slugify('  Щи да каша  ')       → 'schi-da-kasha'
 *   slugify('React 19 — что нового') → 'react-19-chto-novogo'
 */
export const slugify = (text: string): string => todo()
// #endregion

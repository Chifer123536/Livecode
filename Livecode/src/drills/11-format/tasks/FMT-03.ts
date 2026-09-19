import { todo } from '../../../shared/kit'

// #region FMT-03 | Склонение | ★★☆
/**
 * Выбрать форму слова по числу. forms = [одна штука, две штуки, пять штук].
 *
 *   plural(1, FORMS)   → 'товар'
 *   plural(2, FORMS)   → 'товара'
 *   plural(5, FORMS)   → 'товаров'
 *   plural(11, FORMS)  → 'товаров'   // 11-14 всегда третья форма
 *   plural(21, FORMS)  → 'товар'
 */
export type Forms = [string, string, string]
export const plural = (n: number, forms: Forms): string => todo()
// #endregion

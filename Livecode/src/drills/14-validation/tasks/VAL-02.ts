import { todo } from '../../../shared/kit'

// #region VAL-02 | Почта | ★★☆
/**
 * Разумная проверка, а не стандарт RFC: непустое имя, одна собака,
 * домен с точкой и зоной хотя бы из двух букв, без пробелов.
 *
 *   isEmail('a@b.ru')    → true
 *   isEmail('a@b')       → false
 *   isEmail('a b@c.ru')  → false
 */
export const isEmail = (value: string): boolean => todo()
// #endregion

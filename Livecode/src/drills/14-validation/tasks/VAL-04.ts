import { todo } from '../../../shared/kit'

// #region VAL-04 | Проблемы пароля | ★★☆
/**
 * Список ВСЕХ нарушенных правил, а не первое: пользователь должен видеть сразу всё.
 * Правила по порядку: минимум 8 символов, заглавная, строчная, цифра.
 *
 * Примеры:
 *   passwordProblems('abc') → ['Минимум 8 символов', 'Нужна заглавная буква', 'Нужна цифра']
 *   passwordProblems('Password1') → []
 */
export const passwordProblems = (password: string): string[] => todo()
// #endregion

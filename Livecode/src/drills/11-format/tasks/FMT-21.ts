import { todo } from '../../../shared/kit'

// #region FMT-21 | Имя файла | ★★★
/**
 * Обрезать середину, сохранив расширение. Короткое имя не трогать.
 *
 *   formatFileName('документ_очень_длинный.pdf', 15) → 'документ_о….pdf'
 *   formatFileName('мало.txt', 20)                   → 'мало.txt'
 */
export const formatFileName = (name: string, max: number): string => todo()
// #endregion

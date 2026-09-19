import { todo } from '../../../shared/kit'

// #region BRW-13 | Форма в объект | ★★★
/**
 * Данные формы в обычный объект:
 *  - одиночные поля — строки;
 *  - повторяющиеся имена (чекбоксы, мультиселект) — массив;
 *  - поля без name пропускаются.
 */
export const formToObject = (form: HTMLFormElement): Record<string, string | string[]> => todo()
// #endregion

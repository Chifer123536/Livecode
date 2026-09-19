import { todo } from '../../../shared/kit'

// #region BRW-16 | Ловушка фокуса | ★★★
/**
 * Обязательная часть модального окна: Tab по кругу внутри контейнера.
 * С последнего элемента Tab уводит на первый, Shift+Tab с первого — на последний.
 * Возвращает функцию снятия ловушки.
 */
export const trapFocus = (container: HTMLElement): (() => void) => todo()
// #endregion

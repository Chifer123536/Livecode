import { todo } from '../../../shared/kit'

// #region BRW-08 | Клик снаружи | ★★☆
/**
 * Закрыть меню кликом мимо. Клик по самому элементу и его потомкам не считается.
 * Подписка вешается на document, снимается возвращённой функцией.
 */
export const onOutsideClick = (element: HTMLElement, handler: () => void): (() => void) => todo()
// #endregion

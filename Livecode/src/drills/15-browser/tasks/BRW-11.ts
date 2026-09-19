import { todo } from '../../../shared/kit'

// #region BRW-11 | Создание элемента | ★★★
/**
 * Мини-createElement: тег, свойства, дети.
 *  - className и textContent ставятся как свойства;
 *  - ключи вида onClick вешаются обработчиками;
 *  - остальное — setAttribute (в том числе data-* и aria-*);
 *  - дети — строки или узлы.
 */
export type Props = Record<string, unknown>
export const el = (tag: string, props?: Props, children?: Array<Node | string>): HTMLElement => todo()
// #endregion

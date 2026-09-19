import { todo } from '../../../shared/kit'

// #region BRW-12 | Отрисовка списка | ★★★
/**
 * Перерисовать список без фреймворка: очистить контейнер и собрать заново
 * через DocumentFragment — один вход в DOM вместо N.
 * Каждый элемент данных — отдельный <li>, текст класть только через textContent:
 * innerHTML с данными пользователя — это XSS.
 */
export const renderList = (container: HTMLElement, items: string[]): void => todo()
// #endregion

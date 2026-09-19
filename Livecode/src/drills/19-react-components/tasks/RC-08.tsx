import type { ReactNode } from 'react'

// #region RC-08 | Автокомплит | ★★★
/**
 * Инпут с подписью «Город» и выпадающий список подсказок из options (подстрока, без регистра).
 *  - список показывается только когда есть введённый текст и есть совпадения;
 *  - ArrowDown/ArrowUp двигают подсветку, у подсвеченного пункта aria-selected="true";
 *  - Enter выбирает подсвеченный пункт: подставляет в инпут, закрывает список, зовёт onSelect;
 *  - Escape закрывает список, не меняя текст;
 *  - клик по пункту работает как Enter;
 *  - пункты — role="option" внутри role="listbox".
 */
export function Autocomplete({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
	return <div>заглушка</div>
}
// #endregion

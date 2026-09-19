import type { ReactNode } from 'react'

// #region RC-10 | Сортируемая таблица | ★★★
/**
 * Таблица по columns и rows. Клик по заголовку сортирует по этому полю:
 * первый клик — по возрастанию, второй — по убыванию, третий — снова по возрастанию.
 *  - заголовки — кнопки внутри <th>, у активной колонки aria-sort="ascending"|"descending",
 *    у остальных aria-sort="none";
 *  - числа сортируются как числа, строки — через localeCompare;
 *  - исходный массив rows не мутируется.
 */
export type Column = { key: string; title: string }
export type Row = Record<string, string | number>
export function SortableTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
	return <table>заглушка</table>
}
// #endregion

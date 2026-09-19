import type { ReactNode } from 'react'

// #region RC-06 | Пагинация | ★★☆
/**
 * <Pagination total page onChange /> где total — число страниц.
 *  - кнопки «Назад» и «Вперёд», задизейбленные на краях;
 *  - номера страниц кнопками, у текущей aria-current="page";
 *  - если страниц больше 7 — показывать первую, последнюю, текущую с соседями,
 *    остальное схлопывать в <span>…</span>;
 *  - onChange вызывается с номером страницы.
 */
export function Pagination({ total, page, onChange }: { total: number; page: number; onChange: (page: number) => void }) {
	return <nav>заглушка</nav>
}
// #endregion

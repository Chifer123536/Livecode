import type { ReactNode } from 'react'

// #region RB-18 | Аккордеон | ★★☆
/**
 * Список секций. Клик по заголовку раскрывает секцию и закрывает предыдущую —
 * открытой может быть только одна. Повторный клик по открытой закрывает её.
 * Хранить ОДИН openId, а не флаг в каждой секции.
 * У кнопки-заголовка должен быть aria-expanded, тело секции рендерить только когда открыта.
 */
export type Section = { id: string; title: string; body: string }
export function Accordion({ sections }: { sections: Section[] }) {
	return <div>заглушка</div>
}
// #endregion

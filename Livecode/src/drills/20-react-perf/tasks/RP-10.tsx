import type { ReactNode } from 'react'

// #region RP-10 | Мемоизированный элемент списка | ★★★
/**
 * Список задач с кнопкой удаления у каждой.
 * При удалении ОДНОГО элемента остальные перерисовываться не должны.
 * Требуется: memo на элементе, стабильный обработчик и передача id внутрь элемента
 * (а не стрелка `() => onRemove(item.id)` в родителе).
 *
 * У кнопки aria-label `Удалить ${title}`.
 * Внимание: onRender здесь принимает id и передаётся элементу НАПРЯМУЮ.
 * Обёртка вида onRender={() => rowRender(item.id)} создаёт новую функцию каждый рендер
 * и сама же ломает memo — это часть задачи.
 */
export type Item = { id: string; title: string }
export function Row({
	item,
	onRemove,
	onRender,
}: {
	item: Item
	onRemove: (id: string) => void
	onRender: (id: string) => void
}) {
	return <li>заглушка</li>
}
export function RowList({ initial, rowRender }: { initial: Item[]; rowRender: (id: string) => void }) {
	return <ul>заглушка</ul>
}
// #endregion

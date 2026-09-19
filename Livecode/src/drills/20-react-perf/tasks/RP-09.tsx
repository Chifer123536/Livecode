import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-09 | Вынести состояние вниз | ★★★
/**
 * Есть дорогой список и поле ввода. Ввод текста не должен перерисовывать список.
 * Решение — опустить состояние инпута в отдельный маленький компонент.
 *
 * Разметка: инпут с подписью «Заметка», под ним список из items.
 */
export function HeavyList({ items, onRender }: { items: string[] } & Counted) {
	return <ul>заглушка</ul>
}
export function NotePanel({ items, listRender }: { items: string[]; listRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion

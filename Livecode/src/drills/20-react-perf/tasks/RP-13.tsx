import type { ReactNode } from 'react'

// #region RP-13 | Окно списка | ★★★
/**
 * Простая виртуализация: из всего списка отрисовать только элементы,
 * попадающие в окно [start, start + visible).
 * Кнопки «Вниз» и «Вверх» двигают окно на visible элементов, не выходя за границы.
 * Каждый видимый элемент — <li>. Плюс абзац «Показано N из M».
 */
export function WindowedList({ items, visible }: { items: string[]; visible: number }) {
	return <div>заглушка</div>
}
// #endregion

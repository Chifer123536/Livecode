import type { ReactNode } from 'react'

// #region RB-02 | Значение по умолчанию | ★☆☆
/**
 * Бейдж со счётчиком. Если count не передан — считать, что 0.
 * Вывести текст вида «Уведомлений: 0».
 * Значение по умолчанию задать в деструктуризации, не через if внутри.
 */
export function Badge({ count = 0 }: { count?: number }) {
	return <span>заглушка</span>
}
// #endregion

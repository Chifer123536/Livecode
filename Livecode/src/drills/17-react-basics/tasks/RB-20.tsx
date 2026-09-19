import type { ReactNode } from 'react'

// #region RB-20 | Статус в человеческий вид | ★★☆
/**
 * Перевести status в текст через объект-словарь, без цепочки if.
 * Неизвестный статус → «Неизвестно».
 * Вывести <span> с текстом и атрибутом data-status={status}.
 *
 *   'new' → 'Новый', 'paid' → 'Оплачен', 'cancelled' → 'Отменён'
 */
export function StatusBadge({ status }: { status: string }) {
	return <span>заглушка</span>
}
// #endregion

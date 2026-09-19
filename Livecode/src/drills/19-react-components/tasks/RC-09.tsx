import type { ReactNode } from 'react'

// #region RC-09 | Корзина | ★★★
/**
 * Список товаров с количеством:
 *  - у каждой строки кнопки aria-label `Меньше ${title}` и `Больше ${title}`, между ними количество;
 *  - количество не опускается ниже 1; кнопка aria-label `Удалить ${title}` убирает строку;
 *  - строка показывает «{title} — {price} ₽ × {qty} = {sum} ₽»;
 *  - внизу «Итого: N ₽» и «Позиций: K»;
 *
 * Примеры:
 *  - пустая корзина → <p>Корзина пуста</p>.
 */
export type CartLine = { id: string; title: string; price: number; qty: number }
export function ShoppingCart({ initial }: { initial: CartLine[] }) {
	return <div>заглушка</div>
}
// #endregion

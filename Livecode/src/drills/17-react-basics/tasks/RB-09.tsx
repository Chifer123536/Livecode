import type { ReactNode } from 'react'

// #region RB-09 | Производное значение | ★★☆
/**
 * Чекбокс «только в наличии» фильтрует products.
 * Отфильтрованный список ВЫЧИСЛЯЕТСЯ при рендере — никакого второго useState под него.
 * Под списком — текст «Показано: N».
 */
export type Product = { id: number; title: string; inStock: boolean }
export function StockFilter({ products }: { products: Product[] }) {
	return <div>заглушка</div>
}
// #endregion

import { todo } from '../../../shared/kit'
import type { Product } from './_pack'

// #region DAT-01 | Фильтр каталога | ★★☆
/**
 * Все условия применяются одновременно, отсутствующее условие ничего не отсекает.
 *
 *   filterProducts(items, { category: 'phone', maxPrice: 1000, onlyInStock: true })
 *
 * Примеры:
 *   filterProducts(items, {}) → все items
 */
export type ProductFilter = {
	category?: string
	minPrice?: number
	maxPrice?: number
	onlyInStock?: boolean
	minRating?: number
}
export const filterProducts = (items: Product[], filter: ProductFilter): Product[] => todo()
// #endregion

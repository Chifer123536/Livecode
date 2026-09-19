import { todo } from '../../../shared/kit'

/**
 * ПРАВИЛА ПАКА
 * 1. Это данные с сервера: любое поле может отсутствовать, а список — оказаться пустым.
 *    Функция обязана пережить и то, и другое.
 * 2. Никаких мутаций входа. sort и reverse мутируют — копируй перед вызовом.
 * 3. Фильтры комбинируются: пустой фильтр не должен ничего отсекать.
 * 4. Всё чистое: ни Date.now(), ни обращений к внешнему состоянию внутри.
 */

export type Product = {
	id: number
	title: string
	category: string
	price: number
	rating: number
	inStock: boolean
	tags?: string[]
}

export type SortDirection = 'asc' | 'desc'

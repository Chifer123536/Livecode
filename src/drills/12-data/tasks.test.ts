import { describe, expect, it, vi } from 'vitest'
import {
	aggregate,
	combineFilters,
	countByField,
	denormalize,
	diffById,
	fillDateGaps,
	filterProducts,
	groupByField,
	leftJoin,
	movingAverage,
	multiSort,
	normalize,
	pageNumbers,
	paginate,
	priceBuckets,
	renameFields,
	searchInFields,
	selectFields,
	sortByField,
	sortWithPinned,
	summaryRow,
	toggleSort,
	topByGroup,
	upsertById,
	type Product,
} from './tasks'

const ITEMS: Product[] = [
	{ id: 1, title: 'iPhone 15', category: 'phone', price: 900, rating: 4.8, inStock: true },
	{ id: 2, title: 'Pixel 9', category: 'phone', price: 700, rating: 4.5, inStock: false },
	{ id: 3, title: 'MacBook Air', category: 'laptop', price: 1200, rating: 4.9, inStock: true },
	{ id: 4, title: 'Чехол', category: 'accessory', price: 20, rating: 4.1, inStock: true },
]

// #region DAT-01
describe('DAT-01 filterProducts', () => {
	it('фильтр по категории', () => {
		expect(filterProducts(ITEMS, { category: 'phone' }).map(item => item.id)).toEqual([1, 2])
	})
	it('несколько условий сразу', () => {
		expect(filterProducts(ITEMS, { category: 'phone', onlyInStock: true }).map(item => item.id)).toEqual([1])
	})
	it('диапазон цены', () => {
		expect(filterProducts(ITEMS, { minPrice: 700, maxPrice: 900 }).map(item => item.id)).toEqual([1, 2])
	})
	it('нулевая граница не игнорируется', () => {
		expect(filterProducts(ITEMS, { maxPrice: 0 })).toEqual([])
	})
	it('пустой фильтр ничего не отсекает', () => expect(filterProducts(ITEMS, {})).toHaveLength(4))
	it('onlyInStock: false не фильтрует', () => expect(filterProducts(ITEMS, { onlyInStock: false })).toHaveLength(4))
	it('по рейтингу', () => {
		expect(filterProducts(ITEMS, { minRating: 4.8 }).map(item => item.id)).toEqual([1, 3])
	})
})
// #endregion

// #region DAT-02
describe('DAT-02 searchInFields', () => {
	it('без учёта регистра', () => {
		expect(searchInFields(ITEMS, 'IPHONE', ['title']).map(item => item.id)).toEqual([1])
	})
	it('ищет в нескольких полях', () => {
		expect(searchInFields(ITEMS, 'phone', ['title', 'category']).map(item => item.id)).toEqual([1, 2])
	})
	it('пустой запрос возвращает всё', () => expect(searchInFields(ITEMS, '   ', ['title'])).toHaveLength(4))
	it('ничего не найдено', () => expect(searchInFields(ITEMS, 'zzz', ['title'])).toEqual([]))
	it('числовое поле тоже ищется', () => {
		expect(searchInFields(ITEMS, '120', ['price']).map(item => item.id)).toEqual([3])
	})
	it('отсутствующее поле не даёт ложных совпадений', () => {
		expect(searchInFields(ITEMS, 'undefined', ['tags'])).toEqual([])
	})
})
// #endregion

// #region DAT-03
describe('DAT-03 sortByField', () => {
	it('по числу по возрастанию', () => {
		expect(sortByField(ITEMS, 'price').map(item => item.id)).toEqual([4, 2, 1, 3])
	})
	it('по убыванию', () => {
		expect(sortByField(ITEMS, 'price', 'desc').map(item => item.id)).toEqual([3, 1, 2, 4])
	})
	it('по строке с русской локалью', () => {
		const words = [{ title: 'Яблоко' }, { title: 'Ёлка' }, { title: 'Апельсин' }]
		expect(sortByField(words, 'title').map(item => item.title)).toEqual(['Апельсин', 'Ёлка', 'Яблоко'])
	})
	it('не мутирует вход', () => {
		const copy = [...ITEMS]
		sortByField(ITEMS, 'price')
		expect(ITEMS).toEqual(copy)
	})
	it('пустой список', () => expect(sortByField([], 'price' as never)).toEqual([]))
})
// #endregion

// #region DAT-04
describe('DAT-04 multiSort', () => {
	it('второе правило решает при равенстве первого', () => {
		const sorted = multiSort(ITEMS, [
			{ key: 'category', direction: 'asc' },
			{ key: 'price', direction: 'desc' },
		])
		expect(sorted.map(item => item.id)).toEqual([4, 3, 1, 2])
	})
	it('одно правило работает как sortByField', () => {
		expect(multiSort(ITEMS, [{ key: 'price', direction: 'asc' }]).map(item => item.id)).toEqual([4, 2, 1, 3])
	})
	it('пустые правила сохраняют порядок', () => {
		expect(multiSort(ITEMS, []).map(item => item.id)).toEqual([1, 2, 3, 4])
	})
	it('не мутирует вход', () => {
		const copy = [...ITEMS]
		multiSort(ITEMS, [{ key: 'price', direction: 'asc' }])
		expect(ITEMS).toEqual(copy)
	})
})
// #endregion

// #region DAT-05
describe('DAT-05 paginate', () => {
	const numbers = Array.from({ length: 10 }, (_, i) => i + 1)
	it('вторая страница', () => {
		expect(paginate(numbers, 2, 3)).toEqual({ items: [4, 5, 6], page: 2, pages: 4, total: 10 })
	})
	it('последняя неполная страница', () => expect(paginate(numbers, 4, 3).items).toEqual([10]))
	it('страница за пределами зажимается', () => expect(paginate(numbers, 99, 3).page).toBe(4))
	it('страница меньше единицы', () => expect(paginate(numbers, 0, 3).page).toBe(1))
	it('пустой список — одна пустая страница', () => {
		expect(paginate([], 1, 10)).toEqual({ items: [], page: 1, pages: 1, total: 0 })
	})
})
// #endregion

// #region DAT-06
describe('DAT-06 pageNumbers', () => {
	it('текущая в начале', () => expect(pageNumbers(1, 10)).toEqual([1, 2, null, 10]))
	it('текущая в середине', () => expect(pageNumbers(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]))
	it('текущая в конце', () => expect(pageNumbers(10, 10)).toEqual([1, null, 9, 10]))
	it('страниц мало — без разрывов', () => expect(pageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]))
	it('одна страница', () => expect(pageNumbers(1, 1)).toEqual([1]))
	it('разрыв в один номер заполняется номером', () => expect(pageNumbers(4, 6)).toEqual([1, 2, 3, 4, 5, 6]))
	it('ноль страниц', () => expect(pageNumbers(1, 0)).toEqual([]))
})
// #endregion

// #region DAT-07
describe('DAT-07 groupByField', () => {
	it('группирует', () => {
		const groups = groupByField(ITEMS, 'category')
		expect(Object.keys(groups)).toEqual(['phone', 'laptop', 'accessory'])
		expect(groups.phone.map(item => item.id)).toEqual([1, 2])
	})
	it('пустой список', () => expect(Object.keys(groupByField([], 'category' as never))).toEqual([]))
	it('служебное имя как ключ группы', () => {
		const groups = groupByField([{ kind: 'constructor' }], 'kind')
		expect(groups.constructor).toHaveLength(1)
	})
})
// #endregion

// #region DAT-08
describe('DAT-08 aggregate', () => {
	it('считает всё за проход', () => {
		expect(aggregate(ITEMS, 'price')).toEqual({ sum: 2820, avg: 705, min: 20, max: 1200, count: 4 })
	})
	it('пустой список — нули, а не Infinity', () => {
		expect(aggregate([], 'price' as never)).toEqual({ sum: 0, avg: 0, min: 0, max: 0, count: 0 })
	})
	it('один элемент', () => {
		expect(aggregate([ITEMS[0]], 'price')).toEqual({ sum: 900, avg: 900, min: 900, max: 900, count: 1 })
	})
})
// #endregion

// #region DAT-09
describe('DAT-09 countByField', () => {
	it('считает по категориям', () => {
		expect(countByField(ITEMS, 'category')).toEqual({ phone: 2, laptop: 1, accessory: 1 })
	})
	it('булево поле', () => expect(countByField(ITEMS, 'inStock')).toEqual({ true: 3, false: 1 }))
	it('пустой список', () => expect(countByField([], 'category' as never)).toEqual({}))
})
// #endregion

// #region DAT-10
describe('DAT-10 priceBuckets', () => {
	it('раскладывает по диапазонам', () => {
		expect(priceBuckets(ITEMS, [0, 100, 1000])).toEqual([
			{ from: 0, to: 100, count: 1 },
			{ from: 100, to: 1000, count: 2 },
			{ from: 1000, to: null, count: 1 },
		])
	})
	it('граница не попадает в два диапазона', () => {
		const edge: Product[] = [{ ...ITEMS[0], price: 100 }]
		expect(priceBuckets(edge, [0, 100, 1000])[0].count).toBe(0)
		expect(priceBuckets(edge, [0, 100, 1000])[1].count).toBe(1)
	})
	it('пустой список — нулевые счётчики', () => {
		expect(priceBuckets([], [0, 100]).every(bucket => bucket.count === 0)).toBe(true)
	})
})
// #endregion

// #region DAT-11
describe('DAT-11 leftJoin', () => {
	const orders = [
		{ id: 10, userId: 1 },
		{ id: 11, userId: 99 },
	]
	const users = [{ id: 1, name: 'Ян' }]

	it('подставляет совпадение', () => {
		expect(leftJoin(orders, users, 'userId', 'id', 'user')[0].user).toEqual({ id: 1, name: 'Ян' })
	})
	it('нет совпадения — null', () => {
		expect(leftJoin(orders, users, 'userId', 'id', 'user')[1].user).toBeNull()
	})
	it('исходные поля сохраняются', () => {
		expect(leftJoin(orders, users, 'userId', 'id', 'user')[0].id).toBe(10)
	})
	it('пустой правый список', () => {
		expect(leftJoin(orders, [], 'userId', 'id' as never, 'user').every(row => row.user === null)).toBe(true)
	})
})
// #endregion

// #region DAT-12
describe('DAT-12 normalize', () => {
	it('строит справочник и порядок', () => {
		const state = normalize([
			{ id: 2, title: 'b' },
			{ id: 5, title: 'a' },
		])
		expect(state.allIds).toEqual([2, 5])
		expect(state.byId['5'].title).toBe('a')
	})
	it('пустой список', () => expect(normalize([])).toEqual({ byId: {}, allIds: [] }))
})
// #endregion

// #region DAT-13
describe('DAT-13 denormalize', () => {
	it('собирает обратно в порядке allIds', () => {
		const state = { byId: { '1': { id: 1 }, '2': { id: 2 } }, allIds: [2, 1] }
		expect(denormalize(state).map(item => item.id)).toEqual([2, 1])
	})
	it('пропавший id пропускается', () => {
		const state = { byId: { '1': { id: 1 } }, allIds: [1, 404] }
		expect(denormalize(state)).toHaveLength(1)
	})
	it('туда и обратно', () => {
		expect(denormalize(normalize(ITEMS))).toEqual(ITEMS)
	})
})
// #endregion

// #region DAT-14
describe('DAT-14 diffById', () => {
	const previous = [
		{ id: 1, title: 'a' },
		{ id: 2, title: 'b' },
	]
	const next = [
		{ id: 1, title: 'a' },
		{ id: 2, title: 'изменён' },
		{ id: 3, title: 'новый' },
	]

	it('добавленные', () => expect(diffById(previous, next).added.map(item => item.id)).toEqual([3]))
	it('удалённые', () => expect(diffById(next, previous).removed.map(item => item.id)).toEqual([3]))
	it('изменённые', () => {
		expect(diffById(previous, next).updated).toEqual([{ id: 2, title: 'изменён' }])
	})
	it('ничего не изменилось', () => {
		expect(diffById(previous, previous)).toEqual({ added: [], removed: [], updated: [] })
	})
	it('пустые списки', () => {
		expect(diffById([], [])).toEqual({ added: [], removed: [], updated: [] })
	})
})
// #endregion

// #region DAT-15
describe('DAT-15 upsertById', () => {
	it('обновляет на месте', () => {
		const result = upsertById(ITEMS, { ...ITEMS[1], price: 1 })
		expect(result[1].price).toBe(1)
		expect(result).toHaveLength(4)
	})
	it('добавляет в конец', () => {
		const added = { ...ITEMS[0], id: 99 }
		expect(upsertById(ITEMS, added).at(-1)?.id).toBe(99)
	})
	it('не мутирует вход', () => {
		upsertById(ITEMS, { ...ITEMS[0], price: 0 })
		expect(ITEMS[0].price).toBe(900)
	})
})
// #endregion

// #region DAT-16
describe('DAT-16 selectFields', () => {
	it('оставляет только нужное', () => {
		expect(selectFields(ITEMS, ['id', 'title'])[0]).toEqual({ id: 1, title: 'iPhone 15' })
	})
	it('отсутствующее поле не добавляется', () => {
		expect('tags' in selectFields(ITEMS, ['id', 'tags'])[0]).toBe(false)
	})
	it('пустой список полей', () => expect(selectFields(ITEMS, [])[0]).toEqual({}))
})
// #endregion

// #region DAT-17
describe('DAT-17 renameFields', () => {
	it('переименовывает', () => {
		expect(renameFields([{ user_name: 'Ян', age: 30 }], { user_name: 'name' })).toEqual([{ name: 'Ян' }])
	})
	it('поля вне карты выбрасываются', () => {
		expect(Object.keys(renameFields([{ a: 1, b: 2 }], { a: 'x' })[0])).toEqual(['x'])
	})
	it('отсутствующее поле пропускается', () => {
		expect(renameFields([{ a: 1 }], { missing: 'x' })).toEqual([{}])
	})
})
// #endregion

// #region DAT-18
describe('DAT-18 topByGroup', () => {
	it('лучший в каждой группе', () => {
		expect(topByGroup(ITEMS, 'category', 'rating').map(item => item.id)).toEqual([1, 3, 4])
	})
	it('при равенстве побеждает первый', () => {
		const tie = [
			{ id: 1, group: 'a', value: 5 },
			{ id: 2, group: 'a', value: 5 },
		]
		expect(topByGroup(tie, 'group', 'value')[0].id).toBe(1)
	})
	it('пустой список', () => expect(topByGroup([], 'a' as never, 'b' as never)).toEqual([]))
})
// #endregion

// #region DAT-19
describe('DAT-19 movingAverage', () => {
	it('окно 2', () => expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5]))
	it('окно 1 — без изменений', () => expect(movingAverage([1, 2], 1)).toEqual([1, 2]))
	it('окно шире ряда', () => expect(movingAverage([2, 4], 10)).toEqual([2, 3]))
	it('пустой ряд', () => expect(movingAverage([], 3)).toEqual([]))
	it('длина результата равна длине ряда', () => expect(movingAverage([1, 2, 3], 2)).toHaveLength(3))
})
// #endregion

// #region DAT-20
describe('DAT-20 fillDateGaps', () => {
	it('добавляет пропущенные дни', () => {
		expect(
			fillDateGaps(
				[
					{ date: '2026-03-01', value: 5 },
					{ date: '2026-03-03', value: 2 },
				],
				'2026-03-01',
				'2026-03-03'
			)
		).toEqual([
			{ date: '2026-03-01', value: 5 },
			{ date: '2026-03-02', value: 0 },
			{ date: '2026-03-03', value: 2 },
		])
	})
	it('пустой ряд — все нули', () => {
		expect(fillDateGaps([], '2026-03-01', '2026-03-02')).toEqual([
			{ date: '2026-03-01', value: 0 },
			{ date: '2026-03-02', value: 0 },
		])
	})
	it('один день', () => expect(fillDateGaps([], '2026-03-01', '2026-03-01')).toHaveLength(1))
	it('переход через границу месяца', () => {
		expect(fillDateGaps([], '2026-02-28', '2026-03-01').map(point => point.date)).toEqual([
			'2026-02-28',
			'2026-03-01',
		])
	})
})
// #endregion

// #region DAT-21
describe('DAT-21 summaryRow', () => {
	it('числовые поля суммируются', () => {
		expect(summaryRow(ITEMS, ['price'])).toEqual({ price: 2820 })
	})
	it('нечисловые — прочерк', () => {
		expect(summaryRow(ITEMS, ['price', 'title'])).toEqual({ price: 2820, title: '—' })
	})
	it('пустой список — прочерки', () => expect(summaryRow([], ['price' as never])).toEqual({ price: '—' }))
})
// #endregion

// #region DAT-22
describe('DAT-22 sortWithPinned', () => {
	it('закреплённые идут первыми', () => {
		expect(sortWithPinned(ITEMS, [3], 'price').map(item => item.id)).toEqual([3, 4, 2, 1])
	})
	it('порядок закреплённых берётся из списка', () => {
		expect(sortWithPinned(ITEMS, [3, 1], 'price').map(item => item.id)).toEqual([3, 1, 4, 2])
	})
	it('несуществующий id игнорируется', () => {
		expect(sortWithPinned(ITEMS, [404], 'price').map(item => item.id)).toEqual([4, 2, 1, 3])
	})
	it('без закреплённых — обычная сортировка', () => {
		expect(sortWithPinned(ITEMS, [], 'price', 'desc').map(item => item.id)).toEqual([3, 1, 2, 4])
	})
})
// #endregion

// #region DAT-23
describe('DAT-23 toggleSort', () => {
	it('первый клик — asc', () => expect(toggleSort(null, 'price')).toEqual({ key: 'price', direction: 'asc' }))
	it('второй клик — desc', () => {
		expect(toggleSort({ key: 'price', direction: 'asc' }, 'price')).toEqual({ key: 'price', direction: 'desc' })
	})
	it('третий клик — сброс', () => {
		expect(toggleSort({ key: 'price', direction: 'desc' }, 'price')).toBeNull()
	})
	it('клик по другому полю', () => {
		expect(toggleSort({ key: 'price', direction: 'desc' }, 'title')).toEqual({ key: 'title', direction: 'asc' })
	})
})
// #endregion

// #region DAT-24
describe('DAT-24 combineFilters', () => {
	it('проходит только подходящее', () => {
		const predicate = combineFilters<Product>([item => item.inStock, item => item.price < 100])
		expect(ITEMS.filter(predicate).map(item => item.id)).toEqual([4])
	})
	it('пустой список пропускает всё', () => {
		expect(ITEMS.filter(combineFilters<Product>([]))).toHaveLength(4)
	})
	it('вычисление ленивое', () => {
		const second = vi.fn(() => true)
		const predicate = combineFilters<Product>([() => false, second])
		predicate(ITEMS[0])
		expect(second).not.toHaveBeenCalled()
	})
})
// #endregion

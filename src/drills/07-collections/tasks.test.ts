import { describe, expect, it, vi } from 'vitest'
import {
	countBy,
	difference,
	fibonacci,
	groupToMap,
	indexBy,
	intersection,
	invert,
	isSubset,
	lazyFilter,
	lazyMap,
	makeRange,
	mapToObject,
	memoizeByObject,
	mergeSum,
	objectToMap,
	range,
	take,
	topN,
	union,
	uniqueBy,
	zip,
} from './tasks'

type User = { id: number; role: string }

const USERS: User[] = [
	{ id: 1, role: 'admin' },
	{ id: 2, role: 'user' },
	{ id: 3, role: 'user' },
]

// #region COL-01
describe('COL-01 countBy', () => {
	it('считает вхождения', () => {
		expect([...countBy(['a', 'b', 'a'], x => x)]).toEqual([
			['a', 2],
			['b', 1],
		])
	})
	it('считает по вычисленному ключу', () => {
		expect(countBy(USERS, u => u.role).get('user')).toBe(2)
	})
	it('пустой вход — пустой Map', () => expect(countBy([], x => x).size).toBe(0))
	it('ключом может быть объект', () => {
		const key = { a: 1 }
		expect(countBy([key, key], x => x).get(key)).toBe(2)
	})
	it('служебные имена не ломают счётчик', () => {
		expect(countBy(['constructor', 'constructor'], x => x).get('constructor')).toBe(2)
	})
	it('работает с любым итерируемым', () => expect(countBy('aab', ch => ch).get('a')).toBe(2))
})
// #endregion

// #region COL-02
describe('COL-02 groupToMap', () => {
	it('раскладывает по группам', () => {
		expect([...groupToMap([1, 2, 3, 4], n => n % 2)]).toEqual([
			[1, [1, 3]],
			[0, [2, 4]],
		])
	})
	it('сохраняет порядок внутри группы', () => {
		expect(groupToMap(USERS, u => u.role).get('user')).toEqual([USERS[1], USERS[2]])
	})
	it('пустой вход', () => expect(groupToMap([], x => x).size).toBe(0))
})
// #endregion

// #region COL-03
describe('COL-03 indexBy', () => {
	it('строит справочник', () => expect(indexBy(USERS, u => u.id).get(2)).toEqual(USERS[1]))
	it('при дубле побеждает последний', () => {
		const last = { id: 1, role: 'last' }
		expect(indexBy([USERS[0], last], u => u.id).get(1)).toBe(last)
	})
	it('размер равен числу уникальных ключей', () => expect(indexBy(USERS, u => u.role).size).toBe(2))
})
// #endregion

// #region COL-04
describe('COL-04 mapToObject / objectToMap', () => {
	it('Map в объект', () => {
		expect(
			mapToObject(
				new Map([
					['a', 1],
					['b', 2],
				])
			)
		).toEqual({ a: 1, b: 2 })
	})
	it('объект в Map', () => {
		const map = objectToMap({ a: 1, b: 2 })
		expect(map).toBeInstanceOf(Map)
		expect(map.get('b')).toBe(2)
	})
	it('туда и обратно', () => expect(mapToObject(objectToMap({ x: 7 }))).toEqual({ x: 7 }))
	it('пустой объект', () => expect(objectToMap({}).size).toBe(0))
})
// #endregion

// #region COL-05
describe('COL-05 invert', () => {
	it('меняет местами', () => {
		expect([
			...invert(
				new Map([
					['a', 1],
					['b', 2],
				])
			),
		]).toEqual([
			[1, 'a'],
			[2, 'b'],
		])
	})
	it('дубли значений схлопываются в последний ключ', () => {
		expect(
			invert(
				new Map([
					['a', 1],
					['b', 1],
				])
			).get(1)
		).toBe('b')
	})
	it('исходный Map не меняется', () => {
		const source = new Map([['a', 1]])
		invert(source)
		expect([...source]).toEqual([['a', 1]])
	})
})
// #endregion

// #region COL-06
describe('COL-06 mergeSum', () => {
	it('складывает пересекающиеся ключи', () => {
		const merged = mergeSum(
			new Map([['a', 1]]),
			new Map([
				['a', 2],
				['b', 5],
			])
		)
		expect([...merged]).toEqual([
			['a', 3],
			['b', 5],
		])
	})
	it('без аргументов — пустой Map', () => expect(mergeSum().size).toBe(0))
	it('не мутирует входные', () => {
		const first = new Map([['a', 1]])
		mergeSum(first, new Map([['a', 9]]))
		expect(first.get('a')).toBe(1)
	})
})
// #endregion

// #region COL-07
describe('COL-07 topN', () => {
	const stats = new Map([
		['a', 1],
		['b', 9],
		['c', 5],
	])
	it('по убыванию', () =>
		expect(topN(stats, 2)).toEqual([
			['b', 9],
			['c', 5],
		]))
	it('n больше размера', () => expect(topN(stats, 10)).toHaveLength(3))
	it('n = 0', () => expect(topN(stats, 0)).toEqual([]))
	it('при равенстве — порядок вставки', () => {
		const tie = new Map([
			['x', 3],
			['y', 3],
		])
		expect(topN(tie, 2)).toEqual([
			['x', 3],
			['y', 3],
		])
	})
})
// #endregion

// #region COL-08
describe('COL-08 union', () => {
	it('объединяет без дублей', () => {
		expect([...union(new Set([1, 2]), new Set([2, 3]))]).toEqual([1, 2, 3])
	})
	it('возвращает новое множество', () => {
		const a = new Set([1])
		const result = union(a, new Set([2]))
		expect(result).not.toBe(a)
		expect(a.size).toBe(1)
	})
})
// #endregion

// #region COL-09
describe('COL-09 intersection / difference', () => {
	it('пересечение', () => {
		expect([...intersection(new Set([1, 2, 3]), new Set([2, 3, 4]))].sort()).toEqual([2, 3])
	})
	it('пустое пересечение', () => expect(intersection(new Set([1]), new Set([2])).size).toBe(0))
	it('разность', () => expect([...difference(new Set([1, 2, 3]), new Set([2]))]).toEqual([1, 3]))
	it('разность несимметрична', () => {
		expect(difference(new Set([1]), new Set([1, 2])).size).toBe(0)
		expect([...difference(new Set([1, 2]), new Set([1]))]).toEqual([2])
	})
})
// #endregion

// #region COL-10
describe('COL-10 isSubset', () => {
	it('подмножество', () => expect(isSubset(new Set([1]), new Set([1, 2]))).toBe(true))
	it('не подмножество', () => expect(isSubset(new Set([1, 5]), new Set([1, 2]))).toBe(false))
	it('пустое — подмножество любого', () => expect(isSubset(new Set(), new Set([1]))).toBe(true))
	it('равные множества', () => expect(isSubset(new Set([1]), new Set([1]))).toBe(true))
})
// #endregion

// #region COL-11
describe('COL-11 uniqueBy', () => {
	it('оставляет первое вхождение', () => {
		const first = { id: 1, tag: 'first' }
		const dup = { id: 1, tag: 'dup' }
		const other = { id: 2, tag: 'x' }
		expect(uniqueBy([first, dup, other], u => u.id)).toEqual([first, other])
	})
	it('пустой массив', () => expect(uniqueBy([], (x: number) => x)).toEqual([]))
	it('не мутирует вход', () => {
		const source = [1, 1, 2]
		uniqueBy(source, x => x)
		expect(source).toEqual([1, 1, 2])
	})
})
// #endregion

// #region COL-12
describe('COL-12 memoizeByObject', () => {
	it('считает один раз на объект', () => {
		const fn = vi.fn((o: { n: number }) => o.n * 2)
		const memo = memoizeByObject(fn)
		const key = { n: 21 }
		expect(memo(key)).toBe(42)
		expect(memo(key)).toBe(42)
		expect(fn).toHaveBeenCalledTimes(1)
	})
	it('разные объекты считаются отдельно', () => {
		const fn = vi.fn((o: { n: number }) => o.n)
		const memo = memoizeByObject(fn)
		memo({ n: 1 })
		memo({ n: 1 })
		expect(fn).toHaveBeenCalledTimes(2)
	})
	it('кэширует undefined и не пересчитывает', () => {
		const fn = vi.fn((_: object) => undefined)
		const memo = memoizeByObject(fn)
		const key = {}
		memo(key)
		memo(key)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region COL-13
describe('COL-13 range', () => {
	it('обычный диапазон', () => expect([...range(0, 5)]).toEqual([0, 1, 2, 3, 4]))
	it('с шагом', () => expect([...range(0, 10, 3)]).toEqual([0, 3, 6, 9]))
	it('отрицательный шаг', () => expect([...range(5, 0, -2)]).toEqual([5, 3, 1]))
	it('пустой диапазон', () => expect([...range(5, 5)]).toEqual([]))
	it('шаг 0 не зацикливает', () => expect([...range(0, 5, 0)]).toEqual([]))
	it('ленивый: не считает больше, чем спросили', () => {
		const iterator = range(0, 1e9)
		expect(iterator.next().value).toBe(0)
	})
})
// #endregion

// #region COL-14
describe('COL-14 take', () => {
	it('берёт первые n', () => expect(take([1, 2, 3, 4], 2)).toEqual([1, 2]))
	it('n больше длины', () => expect(take([1, 2], 5)).toEqual([1, 2]))
	it('n = 0', () => expect(take([1, 2], 0)).toEqual([]))
	it('работает с бесконечным генератором', () => {
		function* naturals(): Generator<number> {
			let n = 0
			while (true) yield n++
		}
		expect(take(naturals(), 3)).toEqual([0, 1, 2])
	})
	it('работает со строкой и Set', () => {
		expect(take('abc', 2)).toEqual(['a', 'b'])
		expect(take(new Set([1, 2, 3]), 2)).toEqual([1, 2])
	})
})
// #endregion

// #region COL-15
describe('COL-15 lazyMap / lazyFilter', () => {
	it('map по ленивому источнику', () => expect([...lazyMap([1, 2, 3], n => n * 2)]).toEqual([2, 4, 6]))
	it('filter по ленивому источнику', () =>
		expect([...lazyFilter([1, 2, 3, 4], n => n % 2 === 0)]).toEqual([2, 4]))
	it('цепочка не материализует промежуточное', () => {
		const double = vi.fn((n: number) => n * 2)
		expect(take(lazyMap(range(0, 1e9), double), 3)).toEqual([0, 2, 4])
		expect(double).toHaveBeenCalledTimes(3)
	})
	it('filter поверх бесконечного источника', () => {
		expect(take(lazyFilter(fibonacci(), n => n % 2 === 0), 3)).toEqual([0, 2, 8])
	})
})
// #endregion

// #region COL-16
describe('COL-16 zip', () => {
	it('склеивает по позициям', () => {
		expect([...zip([1, 2], ['a', 'b'])]).toEqual([
			[1, 'a'],
			[2, 'b'],
		])
	})
	it('останавливается на коротком', () => {
		expect([...zip([1, 2, 3], 'ab')]).toEqual([
			[1, 'a'],
			[2, 'b'],
		])
	})
	it('пустой источник', () => expect([...zip([], [1])]).toEqual([]))
	it('не тянет лишнее из бесконечного', () => {
		expect([...zip([1, 2], fibonacci())]).toEqual([
			[1, 0],
			[2, 1],
		])
	})
})
// #endregion

// #region COL-17
describe('COL-17 makeRange', () => {
	it('перебирается в for..of', () => {
		const seen: number[] = []
		for (const n of makeRange(1, 4)) seen.push(n)
		expect(seen).toEqual([1, 2, 3])
	})
	it('перебирается ПОВТОРНО', () => {
		const r = makeRange(1, 4)
		expect([...r]).toEqual([1, 2, 3])
		expect([...r]).toEqual([1, 2, 3])
	})
	it('пустой диапазон', () => expect([...makeRange(3, 3)]).toEqual([]))
})
// #endregion

// #region COL-18
describe('COL-18 fibonacci', () => {
	it('первые значения', () => expect(take(fibonacci(), 7)).toEqual([0, 1, 1, 2, 3, 5, 8]))
	it('каждый вызов даёт независимую последовательность', () => {
		const first = fibonacci()
		first.next()
		expect(take(fibonacci(), 2)).toEqual([0, 1])
	})
})
// #endregion

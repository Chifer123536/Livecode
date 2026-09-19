import { describe, expect, it } from 'vitest'
import {
	allTags,
	chunk,
	compact,
	countBy,
	countOf,
	dedupeConsecutive,
	difference,
	doubleAll,
	flattenDeep,
	groupBy,
	indexOfMax,
	insertAt,
	intersect,
	lastN,
	maxBy,
	moveItem,
	onlyEven,
	partition,
	removeAt,
	replaceAt,
	rotate,
	sortBy,
	sortByMany,
	sumBy,
	toColumns,
	toggleItem,
	total,
	unique,
	uniqueBy,
	windowed,
	zip,
	zipObject,
} from './tasks'

const users = [
	{ id: 1, name: 'Ann', role: 'dev', age: 30 },
	{ id: 2, name: 'Bob', role: 'qa', age: 25 },
	{ id: 3, name: 'Cat', role: 'dev', age: 25 },
]

// #region ARR-01
describe('ARR-01 doubleAll', () => {
	it('удваивает', () => expect(doubleAll([1, 2, 3])).toEqual([2, 4, 6]))
	it('пустой массив', () => expect(doubleAll([])).toEqual([]))
	it('не мутирует вход', () => {
		const src = [1, 2]
		doubleAll(src)
		expect(src).toEqual([1, 2])
	})
})
// #endregion

// #region ARR-02
describe('ARR-02 onlyEven', () => {
	it('оставляет чётные', () => expect(onlyEven([1, 2, 3, 4])).toEqual([2, 4]))
	it('ноль чётный', () => expect(onlyEven([0, 1])).toEqual([0]))
	it('не мутирует вход', () => {
		const src = [1, 2, 3]
		onlyEven(src)
		expect(src).toEqual([1, 2, 3])
	})
})
// #endregion

// #region ARR-03
describe('ARR-03 total', () => {
	it('суммирует', () => expect(total([1, 2, 3])).toBe(6))
	it('пустой массив даёт 0', () => expect(total([])).toBe(0))
	it('отрицательные', () => expect(total([-1, -2, 3])).toBe(0))
})
// #endregion

// #region ARR-04
describe('ARR-04 maxBy', () => {
	it('находит максимум', () => expect(maxBy(users, u => u.age)).toEqual(users[0]))
	it('пустой массив → null', () => expect(maxBy([] as typeof users, u => u.age)).toBeNull())
	it('при равенстве берёт первый', () => {
		const list = [{ n: 5, tag: 'first' }, { n: 5, tag: 'second' }]
		expect(maxBy(list, x => x.n)?.tag).toBe('first')
	})
})
// #endregion

// #region ARR-05
describe('ARR-05 countOf', () => {
	it('считает повторы', () => expect(countOf([1, 2, 2, 3], 2)).toBe(2))
	it('нет совпадений', () => expect(countOf([1, 2], 9)).toBe(0))
	it('строки', () => expect(countOf(['a', 'b', 'a'], 'a')).toBe(2))
})
// #endregion

// #region ARR-06
describe('ARR-06 lastN', () => {
	it('последние два', () => expect(lastN([1, 2, 3, 4], 2)).toEqual([3, 4]))
	it('n больше длины', () => expect(lastN([1, 2], 10)).toEqual([1, 2]))
	it('ловушка slice(-0)', () => expect(lastN([1, 2], 0)).toEqual([]))
	it('отрицательный n', () => expect(lastN([1, 2], -3)).toEqual([]))
})
// #endregion

// #region ARR-07
describe('ARR-07 compact', () => {
	it('выкидывает falsy', () => expect(compact([0, 1, '', null, 2])).toEqual([1, 2]))
	it('NaN и false тоже', () => expect(compact([false, NaN, undefined])).toEqual([]))
	it('оставляет пустой объект и массив', () => expect(compact([{}, []])).toHaveLength(2))
})
// #endregion

// #region ARR-08
describe('ARR-08 unique', () => {
	it('убирает повторы', () => expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]))
	it('строки', () => expect(unique(['a', 'a', 'b'])).toEqual(['a', 'b']))
	it('NaN считается одним значением', () => expect(unique([NaN, NaN])).toHaveLength(1))
	it('объекты сравниваются по ссылке', () => expect(unique([{ a: 1 }, { a: 1 }])).toHaveLength(2))
})
// #endregion

// #region ARR-09
describe('ARR-09 uniqueBy', () => {
	it('оставляет первый по ключу', () => {
		const list = [{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }]
		expect(uniqueBy(list, x => x.id)).toEqual([{ id: 1, v: 'a' }, { id: 2, v: 'c' }])
	})
	it('порядок сохраняется', () => expect(uniqueBy(users, u => u.role).map(u => u.role)).toEqual(['dev', 'qa']))
	it('пустой массив', () => expect(uniqueBy([] as typeof users, u => u.id)).toEqual([]))
})
// #endregion

// #region ARR-10
describe('ARR-10 chunk', () => {
	it('по два', () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]))
	it('size больше длины', () => expect(chunk([1, 2], 10)).toEqual([[1, 2]]))
	it('пустой массив', () => expect(chunk([], 3)).toEqual([]))
	it('ровное деление', () => expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]))
})
// #endregion

// #region ARR-11
describe('ARR-11 flattenDeep', () => {
	it('четыре уровня', () => expect(flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]))
	it('пустые вложенные', () => expect(flattenDeep([[], [[]], 1])).toEqual([1]))
	it('уже плоский', () => expect(flattenDeep([1, 2])).toEqual([1, 2]))
	it('строки не разбиваются на символы', () => expect(flattenDeep(['ab', ['cd']])).toEqual(['ab', 'cd']))
})
// #endregion

// #region ARR-12
describe('ARR-12 zip', () => {
	it('равные длины', () => expect(zip([1, 2], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']]))
	it('обрезает по короткому', () => expect(zip([1, 2, 3], ['a'])).toEqual([[1, 'a']]))
	it('пустой массив', () => expect(zip([], ['a'])).toEqual([]))
})
// #endregion

// #region ARR-13
describe('ARR-13 zipObject', () => {
	it('собирает объект', () => expect(zipObject(['a', 'b'], [1, 2])).toEqual({ a: 1, b: 2 }))
	it('пустые входы', () => expect(zipObject([], [])).toEqual({}))
})
// #endregion

// #region ARR-14
describe('ARR-14 intersect', () => {
	it('общие элементы без повторов', () => expect(intersect([1, 2, 3, 2], [2, 3, 4])).toEqual([2, 3]))
	it('нет пересечения', () => expect(intersect([1], [2])).toEqual([]))
	it('порядок как в первом массиве', () => expect(intersect([3, 1, 2], [1, 2, 3])).toEqual([3, 1, 2]))
})
// #endregion

// #region ARR-15
describe('ARR-15 difference', () => {
	it('убирает встречающиеся', () => expect(difference([1, 2, 3], [2])).toEqual([1, 3]))
	it('пустой второй массив', () => expect(difference([1, 2], [])).toEqual([1, 2]))
	it('всё вычлось', () => expect(difference([1, 2], [1, 2])).toEqual([]))
})
// #endregion

// #region ARR-16
describe('ARR-16 partition', () => {
	it('делит по предикату', () => expect(partition([1, 2, 3, 4], n => n % 2 === 0)).toEqual([[2, 4], [1, 3]]))
	it('всё в первую корзину', () => expect(partition([2, 4], n => n % 2 === 0)).toEqual([[2, 4], []]))
	it('пустой массив', () => expect(partition([] as number[], () => true)).toEqual([[], []]))
})
// #endregion

// #region ARR-17
describe('ARR-17 groupBy', () => {
	it('группирует по роли', () =>
		expect(groupBy(users, u => u.role)).toEqual({ dev: [users[0], users[2]], qa: [users[1]] }))
	it('пустой вход', () => expect(groupBy([] as typeof users, u => u.role)).toEqual({}))
	it('одна группа', () => expect(Object.keys(groupBy([1, 2, 3], () => 'all'))).toEqual(['all']))
})
// #endregion

// #region ARR-18
describe('ARR-18 countBy', () => {
	it('считает по ключу', () => expect(countBy(['a', 'b', 'a'], x => x)).toEqual({ a: 2, b: 1 }))
	it('по полю объекта', () => expect(countBy(users, u => u.role)).toEqual({ dev: 2, qa: 1 }))
	it('пустой вход', () => expect(countBy([] as string[], x => x)).toEqual({}))
})
// #endregion

// #region ARR-19
describe('ARR-19 sortBy', () => {
	it('числа как числа', () =>
		expect(sortBy([{ n: 10 }, { n: 9 }, { n: 100 }], x => x.n).map(x => x.n)).toEqual([9, 10, 100]))
	it('строки', () => expect(sortBy(users, u => u.name).map(u => u.name)).toEqual(['Ann', 'Bob', 'Cat']))
	it('не мутирует вход', () => {
		const src = [{ n: 3 }, { n: 1 }]
		sortBy(src, x => x.n)
		expect(src.map(x => x.n)).toEqual([3, 1])
	})
	it('кириллица', () => expect(sortBy(['я', 'а', 'б'], s => s)).toEqual(['а', 'б', 'я']))
})
// #endregion

// #region ARR-20
describe('ARR-20 sortByMany', () => {
	it('сначала роль, потом возраст по убыванию', () => {
		const sorted = sortByMany(users, [
			{ key: 'role', dir: 'asc' },
			{ key: 'age', dir: 'desc' },
		])
		expect(sorted.map(u => u.name)).toEqual(['Ann', 'Cat', 'Bob'])
	})
	it('одно правило', () =>
		expect(sortByMany(users, [{ key: 'age', dir: 'asc' }]).map(u => u.age)).toEqual([25, 25, 30]))
	it('стабильность при равных ключах', () =>
		expect(sortByMany(users, [{ key: 'age', dir: 'asc' }]).slice(0, 2).map(u => u.name)).toEqual(['Bob', 'Cat']))
	it('не мутирует вход', () => {
		const names = users.map(u => u.name)
		sortByMany(users, [{ key: 'age', dir: 'desc' }])
		expect(users.map(u => u.name)).toEqual(names)
	})
})
// #endregion

// #region ARR-21
describe('ARR-21 indexOfMax', () => {
	it('находит индекс', () => expect(indexOfMax([3, 9, 4])).toBe(1))
	it('при равенстве берёт первый', () => expect(indexOfMax([3, 9, 4, 9])).toBe(1))
	it('пустой массив', () => expect(indexOfMax([])).toBe(-1))
	it('отрицательные', () => expect(indexOfMax([-5, -1, -9])).toBe(1))
})
// #endregion

// #region ARR-22
describe('ARR-22 sumBy', () => {
	it('сумма по полю', () => expect(sumBy([{ price: 10 }, { price: 5 }], x => x.price)).toBe(15))
	it('пустой массив', () => expect(sumBy([] as Array<{ price: number }>, x => x.price)).toBe(0))
})
// #endregion

// #region ARR-23
describe('ARR-23 insertAt', () => {
	it('вставляет в середину', () => expect(insertAt([1, 2, 3], 1, 9)).toEqual([1, 9, 2, 3]))
	it('в начало', () => expect(insertAt([1, 2], 0, 9)).toEqual([9, 1, 2]))
	it('индекс за границей зажимается', () => expect(insertAt([1, 2], 99, 9)).toEqual([1, 2, 9]))
	it('отрицательный индекс', () => expect(insertAt([1, 2], -5, 9)).toEqual([9, 1, 2]))
	it('не мутирует вход', () => {
		const src = [1, 2]
		insertAt(src, 1, 9)
		expect(src).toEqual([1, 2])
	})
})
// #endregion

// #region ARR-24
describe('ARR-24 removeAt', () => {
	it('удаляет по индексу', () => expect(removeAt([1, 2, 3], 1)).toEqual([1, 3]))
	it('несуществующий индекс', () => expect(removeAt([1, 2], 9)).toEqual([1, 2]))
	it('удаляет только одно вхождение', () => expect(removeAt([1, 1, 1], 0)).toEqual([1, 1]))
	it('не мутирует вход', () => {
		const src = [1, 2, 3]
		removeAt(src, 0)
		expect(src).toEqual([1, 2, 3])
	})
})
// #endregion

// #region ARR-25
describe('ARR-25 replaceAt', () => {
	it('заменяет', () => expect(replaceAt([1, 2, 3], 1, 9)).toEqual([1, 9, 3]))
	it('несуществующий индекс ничего не ломает', () => expect(replaceAt([1, 2], 9, 5)).toEqual([1, 2]))
	it('не мутирует вход', () => {
		const src = [1, 2]
		replaceAt(src, 0, 9)
		expect(src).toEqual([1, 2])
	})
})
// #endregion

// #region ARR-26
describe('ARR-26 toggleItem', () => {
	it('убирает существующий', () => expect(toggleItem([1, 2], 2)).toEqual([1]))
	it('добавляет отсутствующий', () => expect(toggleItem([1, 2], 3)).toEqual([1, 2, 3]))
	it('из пустого массива', () => expect(toggleItem([] as number[], 1)).toEqual([1]))
	it('не мутирует вход', () => {
		const src = [1, 2]
		toggleItem(src, 1)
		expect(src).toEqual([1, 2])
	})
})
// #endregion

// #region ARR-27
describe('ARR-27 moveItem', () => {
	it('вперёд', () => expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']))
	it('назад', () => expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']))
	it('на место', () => expect(moveItem(['a', 'b'], 0, 0)).toEqual(['a', 'b']))
	it('не мутирует вход', () => {
		const src = ['a', 'b', 'c']
		moveItem(src, 0, 2)
		expect(src).toEqual(['a', 'b', 'c'])
	})
})
// #endregion

// #region ARR-28
describe('ARR-28 rotate', () => {
	it('влево на один', () => expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]))
	it('вправо на один', () => expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3]))
	it('сдвиг больше длины', () => expect(rotate([1, 2, 3], 5)).toEqual([3, 1, 2]))
	it('нулевой сдвиг', () => expect(rotate([1, 2], 0)).toEqual([1, 2]))
	it('пустой массив', () => expect(rotate([], 3)).toEqual([]))
})
// #endregion

// #region ARR-29
describe('ARR-29 windowed', () => {
	it('окна по два', () => expect(windowed([1, 2, 3, 4], 2)).toEqual([[1, 2], [2, 3], [3, 4]]))
	it('окно больше массива', () => expect(windowed([1, 2], 5)).toEqual([]))
	it('окно во весь массив', () => expect(windowed([1, 2], 2)).toEqual([[1, 2]]))
	it('нулевой размер', () => expect(windowed([1, 2], 0)).toEqual([]))
})
// #endregion

// #region ARR-30
describe('ARR-30 allTags', () => {
	it('уникальные и отсортированные', () =>
		expect(allTags([{ tags: ['b', 'a'] }, { tags: ['a', 'c'] }])).toEqual(['a', 'b', 'c']))
	it('пустой список постов', () => expect(allTags([])).toEqual([]))
	it('посты без тегов', () => expect(allTags([{ tags: [] }])).toEqual([]))
})
// #endregion

// #region ARR-31
describe('ARR-31 toColumns', () => {
	it('остаток уходит в первые колонки', () => expect(toColumns([1, 2, 3, 4, 5], 2)).toEqual([[1, 2, 3], [4, 5]]))
	it('по одному в колонке', () => expect(toColumns([1, 2, 3], 3)).toEqual([[1], [2], [3]]))
	it('колонок больше, чем элементов', () => expect(toColumns([1, 2], 3)).toEqual([[1], [2], []]))
	it('одна колонка', () => expect(toColumns([1, 2, 3], 1)).toEqual([[1, 2, 3]]))
})
// #endregion

// #region ARR-32
describe('ARR-32 dedupeConsecutive', () => {
	it('схлопывает подряд идущие', () => expect(dedupeConsecutive([1, 1, 2, 2, 1])).toEqual([1, 2, 1]))
	it('ничего не трогает', () => expect(dedupeConsecutive([1, 2, 3])).toEqual([1, 2, 3]))
	it('всё одинаковое', () => expect(dedupeConsecutive(['a', 'a', 'a'])).toEqual(['a']))
	it('пустой массив', () => expect(dedupeConsecutive([])).toEqual([]))
})
// #endregion

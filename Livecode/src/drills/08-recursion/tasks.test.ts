import { describe, expect, it } from 'vitest'
import {
	breadthFirst,
	buildTree,
	countLeaves,
	deepGet,
	factorial,
	fibMemo,
	filterTree,
	findInTree,
	flattenDeep,
	flattenTree,
	mapTree,
	pathToNode,
	permutations,
	power,
	reverseString,
	sumDigits,
	sumTreeValue,
	treeDepth,
	type FlatItem,
	type TreeNode,
} from './tasks'

const TREE: TreeNode[] = [
	{
		id: 1,
		title: 'Электроника',
		value: 10,
		children: [
			{ id: 2, title: 'Телефоны', value: 5, children: [{ id: 3, title: 'Чехлы', value: 1 }] },
			{ id: 4, title: 'Ноутбуки', value: 2 },
		],
	},
	{ id: 5, title: 'Одежда', value: 7, children: [] },
]

const FLAT: FlatItem[] = [
	{ id: 1, parentId: null, title: 'Электроника' },
	{ id: 2, parentId: 1, title: 'Телефоны' },
	{ id: 3, parentId: 2, title: 'Чехлы' },
	{ id: 4, parentId: 1, title: 'Ноутбуки' },
	{ id: 5, parentId: null, title: 'Одежда' },
]

// #region REC-01
describe('REC-01 factorial', () => {
	it('пять', () => expect(factorial(5)).toBe(120))
	it('ноль — единица', () => expect(factorial(0)).toBe(1))
	it('единица', () => expect(factorial(1)).toBe(1))
	it('десять', () => expect(factorial(10)).toBe(3_628_800))
})
// #endregion

// #region REC-02
describe('REC-02 sumDigits', () => {
	it('многозначное', () => expect(sumDigits(1234)).toBe(10))
	it('одна цифра', () => expect(sumDigits(7)).toBe(7))
	it('ноль', () => expect(sumDigits(0)).toBe(0))
	it('с нулями внутри', () => expect(sumDigits(1002)).toBe(3))
})
// #endregion

// #region REC-03
describe('REC-03 reverseString', () => {
	it('слово', () => expect(reverseString('abc')).toBe('cba'))
	it('пустая строка', () => expect(reverseString('')).toBe(''))
	it('один символ', () => expect(reverseString('a')).toBe('a'))
	it('палиндром не меняется', () => expect(reverseString('шалаш')).toBe('шалаш'))
})
// #endregion

// #region REC-04
describe('REC-04 fibMemo', () => {
	it('маленькие значения', () => {
		expect(fibMemo(0)).toBe(0)
		expect(fibMemo(1)).toBe(1)
		expect(fibMemo(10)).toBe(55)
	})
	it('большое значение считается мгновенно', () => {
		const start = Date.now()
		expect(fibMemo(40)).toBe(102_334_155)
		expect(Date.now() - start).toBeLessThan(200)
	})
	it('переданный кэш заполняется', () => {
		const cache = new Map<number, number>()
		fibMemo(10, cache)
		expect(cache.size).toBeGreaterThan(0)
		expect(cache.get(10)).toBe(55)
	})
	it('вызов без кэша не зависит от прошлых', () => expect(fibMemo(12)).toBe(144))
})
// #endregion

// #region REC-05
describe('REC-05 power', () => {
	it('обычная степень', () => expect(power(2, 10)).toBe(1024))
	it('нулевая степень', () => expect(power(5, 0)).toBe(1))
	it('нечётная степень', () => expect(power(3, 5)).toBe(243))
	it('отрицательная степень', () => expect(power(2, -2)).toBe(0.25))
	it('большая степень не вешает', () => expect(power(2, 30)).toBe(1_073_741_824))
})
// #endregion

// #region REC-06
describe('REC-06 flattenDeep', () => {
	it('до конца', () => expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]))
	it('на один уровень', () => expect(flattenDeep([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]))
	it('глубина 0 — без изменений', () => expect(flattenDeep([1, [2]], 0)).toEqual([1, [2]]))
	it('пустые массивы исчезают', () => expect(flattenDeep([1, [], [[]], 2])).toEqual([1, 2]))
	it('не мутирует вход', () => {
		const source = [1, [2]]
		flattenDeep(source)
		expect(source).toEqual([1, [2]])
	})
})
// #endregion

// #region REC-07
describe('REC-07 countLeaves', () => {
	it('считает листья', () => expect(countLeaves(TREE)).toBe(3))
	it('пустое дерево', () => expect(countLeaves([])).toBe(0))
	it('один узел — один лист', () => expect(countLeaves([{ id: 1, title: 'a' }])).toBe(1))
})
// #endregion

// #region REC-08
describe('REC-08 buildTree', () => {
	it('собирает корни', () => {
		const tree = buildTree(FLAT)
		expect(tree).toHaveLength(2)
		expect(tree[0].id).toBe(1)
		expect(tree[1].id).toBe(5)
	})
	it('вкладывает детей на нужный уровень', () => {
		const tree = buildTree(FLAT)
		expect(tree[0].children?.map(node => node.id)).toEqual([2, 4])
		expect(tree[0].children?.[0].children?.[0].title).toBe('Чехлы')
	})
	it('у листа children — пустой массив', () => {
		expect(buildTree(FLAT)[1].children).toEqual([])
	})
	it('порядок детей как во входе', () => {
		const reordered: FlatItem[] = [
			{ id: 1, parentId: null, title: 'корень' },
			{ id: 3, parentId: 1, title: 'второй' },
			{ id: 2, parentId: 1, title: 'первый' },
		]
		expect(buildTree(reordered)[0].children?.map(node => node.id)).toEqual([3, 2])
	})
	it('ребёнок раньше родителя во входе — всё равно собирается', () => {
		const messy: FlatItem[] = [
			{ id: 2, parentId: 1, title: 'ребёнок' },
			{ id: 1, parentId: null, title: 'родитель' },
		]
		const tree = buildTree(messy)
		expect(tree).toHaveLength(1)
		expect(tree[0].children?.[0].id).toBe(2)
	})
	it('сирота не попадает в результат', () => {
		const orphan: FlatItem[] = [
			{ id: 1, parentId: null, title: 'корень' },
			{ id: 9, parentId: 404, title: 'сирота' },
		]
		expect(flattenTree(buildTree(orphan)).map(node => node.id)).toEqual([1])
	})
	it('пустой вход', () => expect(buildTree([])).toEqual([]))
})
// #endregion

// #region REC-09
describe('REC-09 flattenTree', () => {
	it('в порядке обхода в глубину', () => {
		expect(flattenTree(TREE).map(node => node.id)).toEqual([1, 2, 3, 4, 5])
	})
	it('поле children не тащится', () => {
		expect(Object.keys(flattenTree(TREE)[0]).sort()).toEqual(['id', 'title'])
	})
	it('пустое дерево', () => expect(flattenTree([])).toEqual([]))
})
// #endregion

// #region REC-10
describe('REC-10 findInTree', () => {
	it('находит глубоко', () => expect(findInTree(TREE, 3)?.title).toBe('Чехлы'))
	it('находит корень', () => expect(findInTree(TREE, 5)?.title).toBe('Одежда'))
	it('нет такого — null', () => expect(findInTree(TREE, 404)).toBeNull())
	it('пустое дерево', () => expect(findInTree([], 1)).toBeNull())
})
// #endregion

// #region REC-11
describe('REC-11 treeDepth', () => {
	it('три уровня', () => expect(treeDepth(TREE)).toBe(3))
	it('пустое дерево', () => expect(treeDepth([])).toBe(0))
	it('плоский список', () => expect(treeDepth([{ id: 1, title: 'a' }])).toBe(1))
	it('пустой children не считается уровнем', () =>
		expect(treeDepth([{ id: 1, title: 'a', children: [] }])).toBe(1))
})
// #endregion

// #region REC-12
describe('REC-12 sumTreeValue', () => {
	it('складывает всё дерево', () => expect(sumTreeValue(TREE)).toBe(25))
	it('узлы без value считаются нулём', () =>
		expect(sumTreeValue([{ id: 1, title: 'a', children: [{ id: 2, title: 'b', value: 4 }] }])).toBe(4))
	it('пустое дерево', () => expect(sumTreeValue([])).toBe(0))
})
// #endregion

// #region REC-13
describe('REC-13 filterTree', () => {
	it('оставляет предков подходящего узла', () => {
		const filtered = filterTree(TREE, node => node.title === 'Чехлы')
		expect(filtered).toHaveLength(1)
		expect(filtered[0].id).toBe(1)
		expect(filtered[0].children?.[0].children?.[0].title).toBe('Чехлы')
	})
	it('выбрасывает ветки без совпадений', () => {
		const filtered = filterTree(TREE, node => node.title === 'Чехлы')
		expect(filtered[0].children).toHaveLength(1)
	})
	it('ничего не нашлось — пустой массив', () => {
		expect(filterTree(TREE, () => false)).toEqual([])
	})
	it('подходит всё — структура сохраняется', () => {
		expect(flattenTree(filterTree(TREE, () => true)).map(node => node.id)).toEqual([1, 2, 3, 4, 5])
	})
	it('исходное дерево не меняется', () => {
		filterTree(TREE, node => node.id === 3)
		expect(TREE[0].children).toHaveLength(2)
	})
})
// #endregion

// #region REC-14
describe('REC-14 mapTree', () => {
	it('применяет ко всем узлам', () => {
		const upper = mapTree(TREE, node => ({ ...node, title: node.title.toUpperCase() }))
		expect(upper[0].title).toBe('ЭЛЕКТРОНИКА')
		expect(upper[0].children?.[0].children?.[0].title).toBe('ЧЕХЛЫ')
	})
	it('структура сохраняется', () => {
		const mapped = mapTree(TREE, node => node)
		expect(flattenTree(mapped).map(node => node.id)).toEqual([1, 2, 3, 4, 5])
	})
	it('исходное дерево не меняется', () => {
		mapTree(TREE, node => ({ ...node, title: 'x' }))
		expect(TREE[0].title).toBe('Электроника')
	})
})
// #endregion

// #region REC-15
describe('REC-15 pathToNode', () => {
	it('путь до глубокого узла', () => {
		expect(pathToNode(TREE, 3)?.map(node => node.title)).toEqual(['Электроника', 'Телефоны', 'Чехлы'])
	})
	it('путь до корня — он сам', () => expect(pathToNode(TREE, 5)?.map(node => node.id)).toEqual([5]))
	it('нет узла — null', () => expect(pathToNode(TREE, 404)).toBeNull())
	it('повторный вызов не накапливает мусор', () => {
		pathToNode(TREE, 3)
		expect(pathToNode(TREE, 4)?.map(node => node.id)).toEqual([1, 4])
	})
})
// #endregion

// #region REC-16
describe('REC-16 deepGet', () => {
	const source = { a: { b: [{ c: 1 }] }, zero: 0, nothing: null }
	it('достаёт вложенное', () => expect(deepGet(source, 'a.b.0.c')).toBe(1))
	it('нет пути — fallback', () => expect(deepGet(source, 'a.x.y', 'нет')).toBe('нет'))
	it('без fallback — undefined', () => expect(deepGet(source, 'нет.пути')).toBeUndefined())
	it('значение 0 возвращается, а не подменяется', () => expect(deepGet(source, 'zero', 'нет')).toBe(0))
	it('null по дороге не роняет', () => expect(deepGet(source, 'nothing.a', 'нет')).toBe('нет'))
	it('примитив по дороге не роняет', () => expect(deepGet({ a: 1 }, 'a.b.c', 'нет')).toBe('нет'))
})
// #endregion

// #region REC-17
describe('REC-17 permutations', () => {
	it('три элемента', () => {
		expect(permutations([1, 2, 3])).toEqual([
			[1, 2, 3],
			[1, 3, 2],
			[2, 1, 3],
			[2, 3, 1],
			[3, 1, 2],
			[3, 2, 1],
		])
	})
	it('пустой вход — одна пустая перестановка', () => expect(permutations([])).toEqual([[]]))
	it('один элемент', () => expect(permutations(['a'])).toEqual([['a']]))
	it('количество равно факториалу', () => expect(permutations([1, 2, 3, 4])).toHaveLength(24))
	it('не мутирует вход', () => {
		const source = [1, 2, 3]
		permutations(source)
		expect(source).toEqual([1, 2, 3])
	})
})
// #endregion

// #region REC-18
describe('REC-18 breadthFirst', () => {
	it('идёт по уровням', () => {
		expect(breadthFirst(TREE).map(node => node.id)).toEqual([1, 5, 2, 4, 3])
	})
	it('пустое дерево', () => expect(breadthFirst([])).toEqual([]))
	it('возвращает сами узлы, а не копии', () => expect(breadthFirst(TREE)[0]).toBe(TREE[0]))
})
// #endregion

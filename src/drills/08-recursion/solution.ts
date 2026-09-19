/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 08. Открывать только после своей попытки.
 */

export type TreeNode = {
	id: number
	title: string
	value?: number
	children?: TreeNode[]
}

export type FlatItem = {
	id: number
	parentId: number | null
	title: string
}

export type Nested<T> = Array<T | Nested<T>>

// #region REC-01 | Факториал
/** Базовый случай на 0 и 1 — без него уход в минус и переполнение стека. */
export const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))
// #endregion

// #region REC-02 | Сумма цифр
/** n % 10 — последняя цифра, Math.floor(n / 10) — «откусить» её. База: n === 0. */
export const sumDigits = (n: number): number => {
	const abs = Math.abs(n)
	return abs < 10 ? abs : (abs % 10) + sumDigits(Math.floor(abs / 10))
}
// #endregion

// #region REC-03 | Перевернуть строку
/**
 * Строка длиной 0 или 1 уже перевёрнута — это база.
 * На длинных строках такой вариант съест стек: в проде [...s].reverse().join('').
 */
export const reverseString = (text: string): string =>
	text.length <= 1 ? text : reverseString(text.slice(1)) + text[0]
// #endregion

// #region REC-04 | Фибоначчи с мемоизацией
/**
 * Кэш приходит аргументом со значением по умолчанию — так функция остаётся чистой
 * между вызовами: новый вызов верхнего уровня создаёт новый Map.
 * Без кэша fib(40) — это около 300 миллионов вызовов, с кэшем — 40.
 */
export const fibMemo = (n: number, cache: Map<number, number> = new Map()): number => {
	if (n <= 1) return n
	const cached = cache.get(n)
	if (cached !== undefined) return cached

	const value = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
	cache.set(n, value)
	return value
}
// #endregion

// #region REC-05 | Быстрое возведение в степень
/**
 * x^n = (x^(n/2))², и половина считается ОДИН раз — отсюда log(n).
 * Наивный цикл на n умножений для n = 10⁹ не закончится, этот вариант сделает 30 шагов.
 */
export const power = (base: number, exponent: number): number => {
	if (exponent === 0) return 1
	if (exponent < 0) return 1 / power(base, -exponent)

	const half = power(base, Math.floor(exponent / 2))
	return exponent % 2 === 0 ? half * half : half * half * base
}
// #endregion

// #region REC-06 | Выпрямить на N уровней
/**
 * Глубина уменьшается на каждом погружении. Дошли до нуля — элемент кладём как есть.
 * Array.isArray — единственная надёжная проверка: typeof массива это 'object'.
 */
export const flattenDeep = <T>(items: Nested<T>, depth: number = Infinity): Nested<T> => {
	const result: Nested<T> = []
	for (const item of items) {
		if (Array.isArray(item) && depth > 0) result.push(...flattenDeep(item, depth - 1))
		else result.push(item)
	}
	return result
}
// #endregion

// #region REC-07 | Сколько листьев
/** Ответ узла: лист даёт 1, ветка — сумму ответов детей. */
export const countLeaves = (nodes: TreeNode[]): number =>
	nodes.reduce((total, node) => {
		const children = node.children ?? []
		return total + (children.length === 0 ? 1 : countLeaves(children))
	}, 0)
// #endregion

// #region REC-08 | Плоский список в дерево
/**
 * Два прохода вместо вложенного поиска:
 * 1) Map id → узел — заготовки со своим массивом children;
 * 2) один проход по записям: узел кладётся либо в children родителя, либо в корни.
 * Итог O(n) и порядок детей как во входе. Сирота отбрасывается: родитель не найден.
 */
export const buildTree = (items: FlatItem[]): TreeNode[] => {
	const byId = new Map<number, TreeNode>()
	for (const item of items) byId.set(item.id, { id: item.id, title: item.title, children: [] })

	const roots: TreeNode[] = []
	for (const item of items) {
		const node = byId.get(item.id) as TreeNode
		if (item.parentId === null) {
			roots.push(node)
			continue
		}
		byId.get(item.parentId)?.children?.push(node)
	}
	return roots
}
// #endregion

// #region REC-09 | Дерево в плоский список
/** Порядок — обход в глубину: сам узел, затем поддерево. */
export const flattenTree = (nodes: TreeNode[]): Array<{ id: number; title: string }> =>
	nodes.flatMap(node => [{ id: node.id, title: node.title }, ...flattenTree(node.children ?? [])])
// #endregion

// #region REC-10 | Найти узел по id
/**
 * Ранний выход обязателен: без него обходится всё дерево, даже когда узел уже найден.
 * Поэтому цикл, а не find по рекурсивному результату.
 */
export const findInTree = (nodes: TreeNode[], id: number): TreeNode | null => {
	for (const node of nodes) {
		if (node.id === id) return node
		const found = findInTree(node.children ?? [], id)
		if (found) return found
	}
	return null
}
// #endregion

// #region REC-11 | Глубина дерева
/** Глубина узла = 1 + максимум по детям. Пустой массив даёт 0 — это база. */
export const treeDepth = (nodes: TreeNode[]): number =>
	nodes.length === 0 ? 0 : 1 + Math.max(...nodes.map(node => treeDepth(node.children ?? [])))
// #endregion

// #region REC-12 | Сумма по полю
export const sumTreeValue = (nodes: TreeNode[]): number =>
	nodes.reduce((total, node) => total + (node.value ?? 0) + sumTreeValue(node.children ?? []), 0)
// #endregion

// #region REC-13 | Фильтр дерева
/**
 * Порядок критичен: СНАЧАЛА фильтруем детей, потом решаем судьбу родителя.
 * Иначе узел, который сам не подходит, выбросится вместе с подходящим потомком.
 */
export const filterTree = (nodes: TreeNode[], predicate: (node: TreeNode) => boolean): TreeNode[] => {
	const result: TreeNode[] = []
	for (const node of nodes) {
		const children = filterTree(node.children ?? [], predicate)
		if (predicate(node) || children.length > 0) result.push({ ...node, children })
	}
	return result
}
// #endregion

// #region REC-14 | Преобразовать каждый узел
/**
 * Сначала fn для узла, затем рекурсия по ЕГО детям — так преобразование родителя
 * видно детям, а не наоборот. Копия через спред: исходное дерево не меняется.
 */
export const mapTree = (nodes: TreeNode[], fn: (node: TreeNode) => TreeNode): TreeNode[] =>
	nodes.map(node => {
		const mapped = fn(node)
		return { ...mapped, children: mapTree(mapped.children ?? [], fn) }
	})
// #endregion

// #region REC-15 | Путь до узла
/**
 * Путь собирается на возврате: нашли узел — вернули [узел], выше добавили себя в начало.
 * Внешнего массива-аккумулятора нет, поэтому повторный вызов не тащит мусор от прошлого.
 */
export const pathToNode = (nodes: TreeNode[], id: number): TreeNode[] | null => {
	for (const node of nodes) {
		if (node.id === id) return [node]
		const tail = pathToNode(node.children ?? [], id)
		if (tail) return [node, ...tail]
	}
	return null
}
// #endregion

// #region REC-16 | Значение по пути
/**
 * Проверка на объект перед каждым шагом: иначе на null.b получим исключение,
 * а на 'строка'.length — случайный ответ вместо fallback.
 */
export const deepGet = (source: unknown, path: string, fallback?: unknown): unknown => {
	const segments = path.split('.').filter(Boolean)
	let current: unknown = source

	for (const segment of segments) {
		if (current === null || typeof current !== 'object') return fallback
		const container = current as Record<string, unknown>
		if (!(segment in container)) return fallback
		current = container[segment]
	}
	return current
}
// #endregion

// #region REC-17 | Все перестановки
/**
 * База — пустой вход: ровно одна перестановка, пустая. Именно она собирает всё остальное.
 * Шаг: каждый элемент по очереди становится первым, остальные переставляются рекурсивно.
 * Результатов n!, поэтому дальше 8-9 элементов такое не запускают.
 */
export const permutations = <T>(items: T[]): T[][] => {
	if (items.length === 0) return [[]]

	const result: T[][] = []
	for (let i = 0; i < items.length; i += 1) {
		const rest = [...items.slice(0, i), ...items.slice(i + 1)]
		for (const tail of permutations(rest)) result.push([items[i], ...tail])
	}
	return result
}
// #endregion

// #region REC-18 | Обход в ширину
/**
 * Очередь вместо стека вызовов: берём из начала, детей дописываем в конец —
 * получается порядок по уровням. Рекурсия дала бы обход в глубину.
 * shift() на больших очередях медленный (O(n)), поэтому индекс-указатель вместо него.
 */
export const breadthFirst = (nodes: TreeNode[]): TreeNode[] => {
	const queue = [...nodes]
	const result: TreeNode[] = []

	for (let i = 0; i < queue.length; i += 1) {
		const node = queue[i]
		result.push(node)
		queue.push(...(node.children ?? []))
	}
	return result
}
// #endregion

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 09. Открывать только после своей попытки.
 * В каждом разборе указана сложность — проговаривай её вслух так же.
 */

export type Interval = [number, number]

// #region ALG-01 | Два слагаемых
/**
 * O(n) по времени и памяти. В Map кладём «уже виденное число → его индекс»
 * и на каждом шаге спрашиваем недостающее слагаемое. Один проход, а не два вложенных.
 */
export const twoSum = (nums: number[], target: number): [number, number] | null => {
	const seen = new Map<number, number>()
	for (let i = 0; i < nums.length; i += 1) {
		const need = target - nums[i]
		const found = seen.get(need)
		if (found !== undefined) return [found, i]
		seen.set(nums[i], i)
	}
	return null
}
// #endregion

// #region ALG-02 | Пара в отсортированном
/**
 * O(n) по времени, O(1) по памяти. Сортированность — это подсказка «два указателя»:
 * сумма слишком велика — уменьшаем правый край, слишком мала — увеличиваем левый.
 */
export const hasPairWithSum = (sorted: number[], target: number): boolean => {
	let left = 0
	let right = sorted.length - 1

	while (left < right) {
		const sum = sorted[left] + sorted[right]
		if (sum === target) return true
		if (sum < target) left += 1
		else right -= 1
	}
	return false
}
// #endregion

// #region ALG-03 | Анаграмма
/**
 * O(n) на счётчиках. Первая строка увеличивает счётчик, вторая уменьшает;
 * ушло в минус — букв не хватает, выходим сразу.
 */
export const isAnagram = (first: string, second: string): boolean => {
	if (first.length !== second.length) return false

	const counts = new Map<string, number>()
	for (const char of first) counts.set(char, (counts.get(char) ?? 0) + 1)
	for (const char of second) {
		const left = (counts.get(char) ?? 0) - 1
		if (left < 0) return false
		counts.set(char, left)
	}
	return true
}
// #endregion

// #region ALG-04 | Первый неповторяющийся символ
/** Два прохода — O(n). Один проход не годится: «уникален ли» известно только в конце. */
export const firstUniqueChar = (text: string): number => {
	const counts = new Map<string, number>()
	for (const char of text) counts.set(char, (counts.get(char) ?? 0) + 1)

	for (let i = 0; i < text.length; i += 1) {
		if (counts.get(text[i]) === 1) return i
	}
	return -1
}
// #endregion

// #region ALG-05 | Максимальная сумма подмассива
/**
 * Кадане, O(n) / O(1). current — лучшая сумма, заканчивающаяся на текущем элементе.
 * Именно Math.max(n, current + n), а не сброс в ноль: на всех отрицательных
 * сброс дал бы 0, а правильный ответ — наибольший из отрицательных.
 */
export const maxSubarraySum = (nums: number[]): number => {
	if (nums.length === 0) return 0

	let current = nums[0]
	let best = nums[0]
	for (let i = 1; i < nums.length; i += 1) {
		current = Math.max(nums[i], current + nums[i])
		best = Math.max(best, current)
	}
	return best
}
// #endregion

// #region ALG-06 | Окно фиксированной ширины
/**
 * O(n): сумма первого окна считается честно, дальше только +пришедший −ушедший.
 * Вариант с пересчётом каждого окна — O(n·k), на собесе это назовут вслух.
 */
export const maxWindowSum = (nums: number[], k: number): number => {
	if (k <= 0 || nums.length < k) return 0

	let window = 0
	for (let i = 0; i < k; i += 1) window += nums[i]

	let best = window
	for (let i = k; i < nums.length; i += 1) {
		window += nums[i] - nums[i - k]
		best = Math.max(best, window)
	}
	return best
}
// #endregion

// #region ALG-07 | Самая длинная подстрока без повторов
/**
 * Окно переменной ширины, O(n). last хранит последний индекс каждого символа.
 * Math.max при сдвиге левого края обязателен: без него на 'abba' левый край
 * прыгнет НАЗАД на устаревшую позицию и ответ будет завышен.
 */
export const longestUniqueSubstring = (text: string): number => {
	const last = new Map<string, number>()
	let left = 0
	let best = 0

	for (let right = 0; right < text.length; right += 1) {
		const char = text[right]
		const seen = last.get(char)
		if (seen !== undefined && seen >= left) left = seen + 1
		last.set(char, right)
		best = Math.max(best, right - left + 1)
	}
	return best
}
// #endregion

// #region ALG-08 | Бинарный поиск
/**
 * O(log n). low + (high - low) / 2 вместо (low + high) / 2 — привычка из языков
 * с переполнением int; в JS переполнения нет, но на собесе за это ставят плюс.
 */
export const binarySearch = (sorted: number[], target: number): number => {
	let low = 0
	let high = sorted.length - 1

	while (low <= high) {
		const mid = low + Math.floor((high - low) / 2)
		if (sorted[mid] === target) return mid
		if (sorted[mid] < target) low = mid + 1
		else high = mid - 1
	}
	return -1
}
// #endregion

// #region ALG-09 | Позиция для вставки
/**
 * Левая граница. Отличия от обычного бинпоиска: high = длина (а не длина - 1),
 * цикл со строгим <, и при равенстве мы НЕ останавливаемся, а сужаем вправо —
 * поэтому находится первое вхождение.
 */
export const lowerBound = (sorted: number[], target: number): number => {
	let low = 0
	let high = sorted.length

	while (low < high) {
		const mid = low + Math.floor((high - low) / 2)
		if (sorted[mid] < target) low = mid + 1
		else high = mid
	}
	return low
}
// #endregion

// #region ALG-10 | Циклический сдвиг
/**
 * Остаток по длине обрабатывает k больше длины, а ((k % n) + n) % n — ещё и отрицательные.
 * Пустой массив проверяется отдельно: деление на ноль даст NaN.
 */
export const rotate = <T>(items: T[], k: number): T[] => {
	const n = items.length
	if (n === 0) return []

	const shift = ((k % n) + n) % n
	return [...items.slice(n - shift), ...items.slice(0, n - shift)]
}
// #endregion

// #region ALG-11 | Нули в конец
/**
 * O(n) / O(1). insert — позиция для следующего ненулевого.
 * Сначала уплотняем ненулевые, потом добиваем хвост нулями: порядок сохраняется.
 */
export const moveZeroes = (nums: number[]): void => {
	let insert = 0
	for (const value of nums) {
		if (value !== 0) {
			nums[insert] = value
			insert += 1
		}
	}
	for (let i = insert; i < nums.length; i += 1) nums[i] = 0
}
// #endregion

// #region ALG-12 | Удалить дубли из отсортированного
/**
 * Два указателя на месте. Сравнение с последним записанным, а не с соседом —
 * так работает и на трёх одинаковых подряд.
 */
export const removeDuplicates = (sorted: number[]): number => {
	if (sorted.length === 0) return 0

	let insert = 1
	for (let i = 1; i < sorted.length; i += 1) {
		if (sorted[i] !== sorted[insert - 1]) {
			sorted[insert] = sorted[i]
			insert += 1
		}
	}
	return insert
}
// #endregion

// #region ALG-13 | Слияние отсортированных
/**
 * O(n + m). Хвост одного из массивов дописывается целиком — он уже отсортирован.
 * Вариант [...a, ...b].sort() — O((n+m)·log(n+m)) и потеря смысла задачи.
 */
export const mergeSorted = (first: number[], second: number[]): number[] => {
	const result: number[] = []
	let i = 0
	let j = 0

	while (i < first.length && j < second.length) {
		if (first[i] <= second[j]) result.push(first[i++])
		else result.push(second[j++])
	}
	while (i < first.length) result.push(first[i++])
	while (j < second.length) result.push(second[j++])

	return result
}
// #endregion

// #region ALG-14 | Слить пересекающиеся интервалы
/**
 * Сортировка по началу — O(n log n), дальше один проход.
 * Копия перед сортировкой обязательна: sort мутирует, а вход трогать нельзя.
 * Условие склейки со знаком <=, потому что касание [1,3] и [3,5] — это пересечение.
 */
export const mergeIntervals = (intervals: Interval[]): Interval[] => {
	if (intervals.length === 0) return []

	const sorted = [...intervals].sort((a, b) => a[0] - b[0])
	const result: Interval[] = [[...sorted[0]] as Interval]

	for (const [start, end] of sorted.slice(1)) {
		const last = result[result.length - 1]
		if (start <= last[1]) last[1] = Math.max(last[1], end)
		else result.push([start, end])
	}
	return result
}
// #endregion

// #region ALG-15 | Правильные скобки
/**
 * Стек, O(n). Пары хранятся как закрывающая → открывающая: так проверка — одно сравнение.
 * Пустой стек в конце обязателен, иначе '(((' пройдёт как правильная строка.
 */
export const isBalanced = (text: string): boolean => {
	const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
	const stack: string[] = []

	for (const char of text) {
		if (char === '(' || char === '[' || char === '{') stack.push(char)
		else if (char in pairs) {
			if (stack.pop() !== pairs[char]) return false
		}
	}
	return stack.length === 0
}
// #endregion

// #region ALG-16 | Палиндром с мусором
/**
 * Два указателя, O(n) / O(1): пропускаем всё, что не буква и не цифра, и сравниваем
 * в нижнем регистре. Вариант с очисткой строки проще, но это O(n) лишней памяти.
 */
export const isPalindromeLoose = (text: string): boolean => {
	const isWord = (char: string): boolean => /[\p{L}\p{N}]/u.test(char)

	let left = 0
	let right = text.length - 1

	while (left < right) {
		while (left < right && !isWord(text[left])) left += 1
		while (left < right && !isWord(text[right])) right -= 1
		if (text[left].toLowerCase() !== text[right].toLowerCase()) return false
		left += 1
		right -= 1
	}
	return true
}
// #endregion

// #region ALG-17 | Элемент большинства
/**
 * Бойер — Мур, O(n) / O(1). Работает, потому что большинство «переживает»
 * взаимное уничтожение с любыми другими элементами: их суммарно меньше половины.
 */
export const majorityElement = (nums: number[]): number => {
	let candidate = nums[0]
	let count = 0

	for (const value of nums) {
		if (count === 0) candidate = value
		count += value === candidate ? 1 : -1
	}
	return candidate
}
// #endregion

// #region ALG-18 | Произведение всех, кроме себя
/**
 * Два прохода, O(n) времени и O(1) дополнительной памяти (результат не считается).
 * Первый проход кладёт произведение всего слева, второй домножает на произведение справа.
 * Деление запрещено не из вредности: один ноль во входе ломает весь приём.
 */
export const productExceptSelf = (nums: number[]): number[] => {
	const result: number[] = new Array(nums.length).fill(1)

	let prefix = 1
	for (let i = 0; i < nums.length; i += 1) {
		result[i] = prefix
		prefix *= nums[i]
	}

	let suffix = 1
	for (let i = nums.length - 1; i >= 0; i -= 1) {
		result[i] *= suffix
		suffix *= nums[i]
	}
	return result
}
// #endregion

// #region ALG-19 | Купить и продать
/**
 * O(n) / O(1). Минимум слева — лучшая цена покупки на текущий момент,
 * значит прибыль сегодня = цена − этот минимум. Отрицательную прибыль не берём.
 */
export const maxProfit = (prices: number[]): number => {
	let min = Infinity
	let best = 0

	for (const price of prices) {
		min = Math.min(min, price)
		best = Math.max(best, price - min)
	}
	return best
}
// #endregion

// #region ALG-20 | Общий префикс
/**
 * Вертикальное сравнение: идём по позициям первого слова и проверяем ту же позицию
 * во всех остальных. Выход на первом несовпадении — O(суммы длин) в худшем случае.
 */
export const longestCommonPrefix = (words: string[]): string => {
	if (words.length === 0) return ''

	const first = words[0]
	for (let i = 0; i < first.length; i += 1) {
		for (const word of words) {
			if (i >= word.length || word[i] !== first[i]) return first.slice(0, i)
		}
	}
	return first
}
// #endregion

// #region ALG-21 | Быстрая сортировка
/**
 * В среднем O(n log n), в худшем O(n²) — когда опорный каждый раз оказывается краем
 * (например, на уже отсортированном входе с первым элементом в роли опорного).
 * Средний элемент в качестве опорного эту ловушку сглаживает.
 * Равные складываем отдельно — иначе на массиве одинаковых чисел рекурсия не сойдётся.
 */
export const quickSort = (nums: number[]): number[] => {
	if (nums.length <= 1) return [...nums]

	const pivot = nums[Math.floor(nums.length / 2)]
	const less: number[] = []
	const equal: number[] = []
	const greater: number[] = []

	for (const value of nums) {
		if (value < pivot) less.push(value)
		else if (value > pivot) greater.push(value)
		else equal.push(value)
	}
	return [...quickSort(less), ...equal, ...quickSort(greater)]
}
// #endregion

// #region ALG-22 | Сортировка слиянием
/**
 * Всегда O(n log n) и стабильна: при равенстве берём элемент из левой половины (<=).
 * Платим за это O(n) памяти — в этом и разница с быстрой сортировкой.
 */
export const mergeSort = (nums: number[]): number[] => {
	if (nums.length <= 1) return [...nums]

	const middle = Math.floor(nums.length / 2)
	return mergeSorted(mergeSort(nums.slice(0, middle)), mergeSort(nums.slice(middle)))
}
// #endregion

// #region ALG-23 | Группировка анаграмм
/**
 * Ключ — отсортированные буквы, O(n·k log k). Map сохраняет порядок вставки,
 * поэтому группы выходят в порядке первого появления без доп. сортировки.
 */
export const groupAnagrams = (words: string[]): string[][] => {
	const groups = new Map<string, string[]>()

	for (const word of words) {
		const key = [...word].sort().join('')
		const bucket = groups.get(key)
		if (bucket) bucket.push(word)
		else groups.set(key, [word])
	}
	return [...groups.values()]
}
// #endregion

// #region ALG-24 | Топ-K частых
/**
 * Счётчик + сортировка по частоте, O(n log n). Map хранит порядок первого появления,
 * а сортировка стабильна — поэтому равные частоты остаются в этом порядке.
 * Для больших n правильный ответ на собесе — куча или блочная сортировка за O(n).
 */
export const topKFrequent = (nums: number[], k: number): number[] => {
	const counts = new Map<number, number>()
	for (const value of nums) counts.set(value, (counts.get(value) ?? 0) + 1)

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, Math.max(0, k))
		.map(([value]) => value)
}
// #endregion

// #region ALG-25 | Лестница
/**
 * Динамика снизу вверх, O(n) / O(1). На ступень n можно попасть с n-1 и с n-2,
 * значит способов столько же, сколько сумма — это ряд Фибоначчи со сдвигом.
 */
export const climbStairs = (n: number): number => {
	if (n <= 2) return Math.max(1, n)

	let previous = 1
	let current = 2
	for (let step = 3; step <= n; step += 1) {
		;[previous, current] = [current, previous + current]
	}
	return current
}
// #endregion

// #region ALG-26 | Размен монетами
/**
 * Динамика O(amount · количество монет). dp[s] — минимум монет на сумму s.
 * Infinity как «недостижимо» удобнее -1: его можно безопасно сравнивать и прибавлять.
 * Жадность тут неверна, и это ровно то, что проверяет интервьюер.
 */
export const coinChange = (coins: number[], amount: number): number => {
	const dp: number[] = new Array(amount + 1).fill(Infinity)
	dp[0] = 0

	for (let sum = 1; sum <= amount; sum += 1) {
		for (const coin of coins) {
			if (coin <= sum) dp[sum] = Math.min(dp[sum], dp[sum - coin] + 1)
		}
	}
	return dp[amount] === Infinity ? -1 : dp[amount]
}
// #endregion

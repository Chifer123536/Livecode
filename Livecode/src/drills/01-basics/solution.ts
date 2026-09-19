/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 01. Открывать только после своей попытки.
 * Проверяются командой `yarn verify` — она гоняет тесты против этого файла.
 */

// #region BAS-01 | Сумма двух чисел
/** Ловушка на собесе: '2' + 3 === '23'. Плюс склеивает, если хоть один операнд строка. */
export const sum = (a: number, b: number): number => a + b
// #endregion

// #region BAS-02 | Чётное число
/** -3 % 2 === -1, а не 1. Поэтому сравнение именно с 0, иначе отрицательные сломаются. */
export const isEven = (n: number): boolean => n % 2 === 0
// #endregion

// #region BAS-03 | Максимум из трёх
/** Math.max принимает сколько угодно аргументов. Math.max() без аргументов вернёт -Infinity. */
export const max3 = (a: number, b: number, c: number): number => Math.max(a, b, c)
// #endregion

// #region BAS-04 | Модуль числа
/** Унарный минус на -0 даст 0, так что 0 обрабатывается сам собой. */
export const abs = (n: number): number => (n < 0 ? -n : n)
// #endregion

// #region BAS-05 | Зажать в диапазон
/**
 * Порядок важен: сначала поднимаем до min, потом опускаем до max.
 * Если min > max, то при таком порядке победит max — стоит уточнить у интервьюера,
 * что делать с невалидным диапазоном.
 */
export const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n))
// #endregion

// #region BAS-06 | Среднее арифметическое
/** Ранний выход спасает от NaN: 0 / 0 === NaN, и это утечёт дальше во весь расчёт. */
export const average = (nums: number[]): number =>
	nums.length === 0 ? 0 : nums.reduce((acc, n) => acc + n, 0) / nums.length
// #endregion

// #region BAS-07 | Обратный отсчёт
/** Array.from({ length }) даёт пустой массив при n <= 0 бесплатно — отдельный if не нужен. */
export const countdown = (n: number): number[] => Array.from({ length: Math.max(0, n) }, (_, i) => n - i)
// #endregion

// #region BAS-08 | Диапазон с шагом
/**
 * Длина считается заранее: ceil((to - from) / step). Цикл while с накоплением
 * дробного шага копит погрешность float, а формула — нет.
 */
export const range = (from: number, to: number, step = 1): number[] => {
	if (step <= 0 || from >= to) return []
	const length = Math.ceil((to - from) / step)
	return Array.from({ length }, (_, i) => from + i * step)
}
// #endregion

// #region BAS-09 | Факториал
/** Рекурсия тоже принимается, но итерация не упирается в стек. 0! === 1 — база. */
export const factorial = (n: number): number => {
	let result = 1
	for (let i = 2; i <= n; i++) result *= i
	return result
}
// #endregion

// #region BAS-10 | FizzBuzz
/** Порядок проверок: сначала 15. Начнёшь с 3 — 'FizzBuzz' не выпадет никогда. */
export const fizzbuzz = (n: number): string[] => {
	const out: string[] = []
	for (let i = 1; i <= n; i++) {
		if (i % 15 === 0) out.push('FizzBuzz')
		else if (i % 3 === 0) out.push('Fizz')
		else if (i % 5 === 0) out.push('Buzz')
		else out.push(String(i))
	}
	return out
}
// #endregion

// #region BAS-11 | Простое число
/**
 * Условие i * i <= n вместо i <= Math.sqrt(n): нет вызова sqrt в каждой итерации
 * и нет проблем с точностью. Сложность O(sqrt(n)).
 */
export const isPrime = (n: number): boolean => {
	if (!Number.isInteger(n) || n < 2) return false
	for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
	return true
}
// #endregion

// #region BAS-12 | Количество цифр
/** Math.abs обязателен, иначе минус попадёт в длину строки. */
export const digitCount = (n: number): number => String(Math.abs(Math.trunc(n))).length
// #endregion

// #region BAS-13 | Сумма цифр
/** Number(d) вместо +d — читается лучше, работает одинаково. */
export const sumDigits = (n: number): number =>
	String(Math.abs(Math.trunc(n)))
		.split('')
		.reduce((acc, d) => acc + Number(d), 0)
// #endregion

// #region BAS-14 | Перевернуть число
/** Number('0021') === 21 — ведущие нули отпадают сами. Знак навешиваем в конце. */
export const reverseNumber = (n: number): number => {
	const reversed = Number([...String(Math.abs(n))].reverse().join(''))
	return n < 0 ? -reversed : reversed
}
// #endregion

// #region BAS-15 | НОД
/** Алгоритм Евклида: пока b не ноль, сдвигаем пару (a, b) → (b, a % b). O(log min(a,b)). */
export const gcd = (a: number, b: number): number => {
	let x = Math.abs(a)
	let y = Math.abs(b)
	while (y !== 0) [x, y] = [y, x % y]
	return x
}
// #endregion

// #region BAS-16 | Високосный год
/** Порядок условий и есть задача: 1900 делится на 100 и не делится на 400 — не високосный. */
export const isLeapYear = (year: number): boolean => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
// #endregion

// #region BAS-17 | Округление до N знаков
/**
 * Проверенные в Node числа, их стоит помнить дословно:
 *   2.675 * 100 === 267.5              → Math.round → 2.68
 *   (2.675).toFixed(2) === '2.67'      ← toFixed смотрит на точное значение double 2.674999...
 *   1.005 * 100 === 100.49999999999999 → Math.round → 1     (ожидали 1.01)
 *   Math.round(-2.5) === -2, а (-2.5).toFixed(0) === '-3'
 * Вывод для собеса: «умножить-округлить-разделить» и toFixed дают РАЗНЫЕ результаты,
 * оба по-своему правы, потому что 0.1 + 0.2 === 0.30000000000000004.
 * Деньги на проде считают в целых копейках, а выводят через Intl.NumberFormat.
 */
export const roundTo = (n: number, digits: number): number => {
	const factor = 10 ** digits
	return Math.round(n * factor) / factor
}
// #endregion

// #region BAS-18 | Процент
/** Защита от total === 0 — первое, что смотрит интервьюер. */
export const percent = (part: number, total: number): number =>
	total === 0 ? 0 : Math.round((part / total) * 1000) / 10
// #endregion

// #region BAS-19 | Число Фибоначчи
/** Два указателя вместо массива: O(n) по времени, O(1) по памяти. */
export const fib = (n: number): number => {
	let prev = 0
	let curr = 1
	if (n === 0) return 0
	for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr]
	return curr
}
// #endregion

// #region BAS-20 | В двоичную систему
/** Ноль — отдельный случай: цикл while (n > 0) для него не выполнится ни разу. */
export const toBinary = (n: number): string => {
	if (n === 0) return '0'
	let rest = n
	let out = ''
	while (rest > 0) {
		out = String(rest % 2) + out
		rest = Math.floor(rest / 2)
	}
	return out
}
// #endregion

// #region BAS-21 | Минимум и максимум за один проход
/**
 * Math.min(...nums) на массиве в 100k элементов кинет RangeError: too many arguments.
 * Один проход циклом — и безопасно, и O(n) вместо двух проходов.
 */
export const minMax = (nums: number[]): [number, number] | null => {
	if (nums.length === 0) return null
	let min = nums[0]
	let max = nums[0]
	for (const n of nums) {
		if (n < min) min = n
		if (n > max) max = n
	}
	return [min, max]
}
// #endregion

// #region BAS-22 | Знак числа
/** Math.sign(-0) === -0 — редкий, но реальный подвох, если сравнивать через ===. */
export const sign = (n: number): number => (n > 0 ? 1 : n < 0 ? -1 : 0)
// #endregion

// #region BAS-23 | Полный квадрат
/** Number.isInteger надёжнее, чем сравнение с Math.floor: не путается на -0 и Infinity. */
export const isPerfectSquare = (n: number): boolean => n >= 0 && Number.isInteger(Math.sqrt(n))
// #endregion

// #region BAS-24 | Секунды в часы:минуты:секунды
/** padStart — штатный способ добить нулями. Порядок: часы из всего, минуты из остатка часа. */
export const secondsToTime = (totalSeconds: number): string => {
	const pad = (v: number) => String(v).padStart(2, '0')
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
// #endregion

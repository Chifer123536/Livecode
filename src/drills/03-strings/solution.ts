/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 03. Открывать только после своей попытки.
 */

// #region STR-01 | Перевернуть строку
/**
 * [...text] идёт по итератору строки и не рвёт суррогатные пары,
 * поэтому эмодзи переживают разворот. split('') — рвёт.
 */
export const reverse = (text: string): string => [...text].reverse().join('')
// #endregion

// #region STR-02 | Первая заглавная
/**
 * charAt(0) на пустой строке вернёт '', а text[0] вернёт undefined и склеит 'undefined'.
 * В этом вся разница и весь смысл теста на пустую строку.
 */
export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
// #endregion

// #region STR-03 | Считать гласные
/** Набор гласных держим строкой — includes по ней читается лучше регулярки. */
const VOWELS = 'aeiouаеёиоуыэюя'
export const countVowels = (text: string): number =>
	[...text.toLowerCase()].filter(char => VOWELS.includes(char)).length
// #endregion

// #region STR-04 | Палиндром
/**
 * Сначала нормализуем: нижний регистр и только буквы с цифрами.
 * В классе символов обязательно 'ё' — без неё кириллический текст поедет.
 */
export const isPalindrome = (text: string): boolean => {
	const clean = text.toLowerCase().replace(/[^a-zа-яё0-9]/g, '')
	return clean === [...clean].reverse().join('')
}
// #endregion

// #region STR-05 | Обрезать по символам
/** max - 1 символов плюс многоточие: сам знак тоже занимает место в лимите. */
export const truncate = (text: string, max: number): string =>
	text.length <= max ? text : text.slice(0, Math.max(0, max - 1)) + '…'
// #endregion

// #region STR-06 | Обрезать по словам
/**
 * Набираем слова, пока итог вместе с многоточием влезает в лимит.
 * Если не влезло ни одно слово, честно режем по символам — иначе вернули бы одно многоточие.
 */
export const truncateWords = (text: string, max: number): string => {
	if (text.length <= max) return text

	const words = text.split(/\s+/).filter(Boolean)
	let line = ''

	for (const word of words) {
		const next = line ? `${line} ${word}` : word
		if (next.length + 1 > max) break
		line = next
	}

	return line ? `${line}…` : truncate(text, max)
}
// #endregion

// #region STR-07 | Каждое слово с заглавной
/** Переиспользуем capitalize — на собесе это плюс: «я уже написал эту функцию». */
export const titleCase = (text: string): string => text.split(' ').map(capitalize).join(' ')
// #endregion

// #region STR-08 | Инициалы
/**
 * split(/\s+/) вместо split(' '): при двойных пробелах второй вариант
 * даст пустые строки, и обращение к w[0] уронит код.
 */
export const initials = (fullName: string): string =>
	fullName
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map(word => word[0].toUpperCase())
		.join('')
// #endregion

// #region STR-09 | Маска карты
/** Последние четыре цифры видны, остальное звёздочки. Группировку собираем вручную. */
export const maskCard = (digits: string): string => {
	const tail = digits.slice(-4)
	const hiddenGroups = Math.max(0, Math.ceil((digits.length - 4) / 4))
	return [...Array(hiddenGroups).fill('****'), tail].join(' ')
}
// #endregion

// #region STR-10 | Анаграммы
/**
 * Нормализация плюс сортировка символов. Сравнение длин — дешёвый ранний выход,
 * который стоит проговорить вслух.
 */
export const isAnagram = (a: string, b: string): boolean => {
	const normalize = (text: string) =>
		[...text.toLowerCase().replace(/\s/g, '')].sort((x, y) => x.localeCompare(y)).join('')
	const left = normalize(a)
	const right = normalize(b)
	return left.length === right.length && left === right
}
// #endregion

// #region STR-11 | Количество слов
/** filter(Boolean) нужен: split пустой строки даёт [''], и без фильтра получится 1. */
export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length
// #endregion

// #region STR-12 | Телефон
/**
 * Сначала оставляем только цифры, потом проверяем длину.
 * Формат собирается срезами — читается лучше регулярки с пятью группами,
 * хотя вариант с replace и $1..$5 тоже принимается.
 */
export const formatPhone = (digits: string): string => {
	const clean = digits.replace(/\D/g, '')
	if (clean.length !== 11) return digits
	return `+${clean[0]} (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9)}`
}
// #endregion

// #region STR-13 | Самый частый символ
/**
 * Map сохраняет порядок вставки, поэтому при равных счётчиках строгое >
 * оставит первый встреченный символ. С >= победил бы последний.
 */
export const mostFrequent = (text: string): string => {
	const counts = new Map<string, number>()
	for (const char of text.replace(/\s/g, '')) counts.set(char, (counts.get(char) ?? 0) + 1)

	let best = ''
	let bestCount = 0
	for (const [char, count] of counts) {
		if (count > bestCount) {
			best = char
			bestCount = count
		}
	}
	return best
}
// #endregion

// #region STR-14 | Слаг из заголовка
/**
 * Порядок шагов: нижний регистр → транслитерация → всё лишнее в дефис →
 * схлопнуть дефисы → обрезать края. Поменяешь местами — получишь дефисы по краям.
 * 'щ' даёт 'sch', 'ъ' и 'ь' исчезают — это стандартная схема для русских URL.
 */
const TRANSLIT: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
	к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
	х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export const slugify = (text: string): string =>
	[...text.toLowerCase()]
		.map(char => TRANSLIT[char] ?? char)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
// #endregion

// #region STR-15 | camelCase в kebab-case
/** Перед каждой заглавной ставим дефис и опускаем регистр. */
export const camelToKebab = (text: string): string => text.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
// #endregion

// #region STR-16 | kebab-case в camelCase
/** Захватываем букву после дефиса и поднимаем её регистр, сам дефис выкидываем. */
export const kebabToCamel = (text: string): string =>
	text.replace(/-([a-zа-яё0-9])/g, (_, char: string) => char.toUpperCase())
// #endregion

// #region STR-17 | Дополнить слева
/** padStart сам ничего не делает, если строка уже достаточно длинная. */
export const leftPad = (text: string, length: number, char = ' '): string => text.padStart(length, char)
// #endregion

// #region STR-18 | Экранировать HTML
/**
 * Амперсанд заменяется ПЕРВЫМ. Иначе он повторно экранирует уже вставленные
 * сущности, и &lt; превратится в &amp;lt;. Это самая частая ошибка в задаче.
 */
export const escapeHtml = (text: string): string =>
	text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
// #endregion

// #region STR-19 | Шаблон
/**
 * \s* в регулярке разрешает пробелы внутри скобок.
 * ?? '' превращает отсутствующий ключ в пустую строку — иначе в текст попадёт 'undefined'.
 */
export const template = (text: string, values: Record<string, string | number>): string =>
	text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(values[key] ?? ''))
// #endregion

// #region STR-20 | Сколько раз встречается подстрока
/**
 * Шагаем на длину иглы, поэтому перекрытий нет: в 'abababa' для 'aba' это 2, а не 3.
 * Пустая игла обязана давать 0, иначе цикл станет бесконечным.
 */
export const countSubstring = (text: string, needle: string): number => {
	if (!needle) return 0

	let count = 0
	let index = text.indexOf(needle)

	while (index !== -1) {
		count += 1
		index = text.indexOf(needle, index + needle.length)
	}
	return count
}
// #endregion

// #region STR-21 | Общий префикс
/**
 * Берём первое слово за основу и укорачиваем его, пока оно не станет префиксом всех.
 * Альтернатива — сравнение по столбцам символов; обе O(n * m), выбирай читаемую.
 */
export const longestCommonPrefix = (words: string[]): string => {
	if (words.length === 0) return ''

	let prefix = words[0]
	for (const word of words.slice(1)) {
		while (prefix && !word.startsWith(prefix)) prefix = prefix.slice(0, -1)
		if (!prefix) return ''
	}
	return prefix
}
// #endregion

// #region STR-22 | Сжатие повторов
/**
 * Идём по символам, считая длину текущей серии. Цифру не пишем, когда серия из одного —
 * иначе 'abc' раздулось бы в 'a1b1c1', что длиннее исходника.
 */
export const compress = (text: string): string => {
	if (!text) return ''

	let out = ''
	let run = 1

	for (let i = 1; i <= text.length; i++) {
		if (text[i] === text[i - 1]) {
			run += 1
			continue
		}
		out += run > 1 ? `${text[i - 1]}${run}` : text[i - 1]
		run = 1
	}
	return out
}
// #endregion

// #region STR-23 | Сбалансированные скобки
/**
 * Стек: открывающую кладём, закрывающую сверяем с вершиной.
 * Два условия провала: вершина не та и стек пуст на закрывающей.
 * В конце стек обязан быть пустым, иначе есть незакрытые.
 */
export const isBalanced = (text: string): boolean => {
	const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
	const stack: string[] = []

	for (const char of text) {
		if (char === '(' || char === '[' || char === '{') {
			stack.push(char)
			continue
		}
		if (char in pairs) {
			if (stack.pop() !== pairs[char]) return false
		}
	}
	return stack.length === 0
}
// #endregion

// #region STR-24 | Подсветить совпадение
/**
 * Спецсимволы в запросе обязательно экранируются, иначе ввод '(' уронит конструктор RegExp.
 * $& в замене — это весь найденный фрагмент, поэтому исходный регистр сохраняется.
 * На проде вставлять такую строку через dangerouslySetInnerHTML можно только
 * после экранирования самого текста — иначе это готовая XSS-дыра.
 */
export const highlight = (text: string, query: string): string => {
	if (!query) return text
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	return text.replace(new RegExp(escaped, 'gi'), '<mark>$&</mark>')
}
// #endregion

// #region STR-25 | Размер файла
/**
 * Индекс единицы измерения — логарифм по основанию 1024.
 * Math.round(x * 100) / 100 вместо toFixed(2): toFixed вернул бы СТРОКУ
 * и оставил хвостовые нули ('1.00 КБ' вместо '1 КБ').
 */
const BYTE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ']

export const formatBytes = (bytes: number): string => {
	if (bytes === 0) return '0 Б'

	const power = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)))
	const value = bytes / 1024 ** power
	const rounded = Math.round(value * 100) / 100

	return `${rounded} ${BYTE_UNITS[power]}`
}
// #endregion

// #region STR-26 | Нормализовать пробелы
/** \s покрывает пробел, табуляцию и перенос строки. Сначала trim, потом схлопывание. */
export const normalizeSpaces = (text: string): string => text.trim().replace(/\s+/g, ' ')
// #endregion

// #region STR-27 | Разобрать ФИО
/** Деструктуризация с значениями по умолчанию закрывает случай неполного имени. */
export type FullName = { last: string; first: string; middle: string }

export const splitName = (fullName: string): FullName => {
	const [last = '', first = '', middle = ''] = fullName.trim().split(/\s+/).filter(Boolean)
	return { last, first, middle }
}
// #endregion

// #region STR-28 | Перенос по словам
/**
 * Копим строку, пока следующее слово влезает. Не влезло — закрываем строку и начинаем новую.
 * Слово длиннее ширины занимает свою строку целиком: рвать слова задача не просит.
 */
export const wordWrap = (text: string, width: number): string[] => {
	const words = text.split(/\s+/).filter(Boolean)
	const lines: string[] = []
	let line = ''

	for (const word of words) {
		if (!line) {
			line = word
			continue
		}
		if (`${line} ${word}`.length <= width) line = `${line} ${word}`
		else {
			lines.push(line)
			line = word
		}
	}

	if (line) lines.push(line)
	return lines
}
// #endregion

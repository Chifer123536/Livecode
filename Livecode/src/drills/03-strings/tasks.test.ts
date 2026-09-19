import { describe, expect, it } from 'vitest'
import {
	camelToKebab,
	capitalize,
	compress,
	countSubstring,
	countVowels,
	escapeHtml,
	formatBytes,
	formatPhone,
	highlight,
	initials,
	isAnagram,
	isBalanced,
	isPalindrome,
	kebabToCamel,
	leftPad,
	longestCommonPrefix,
	maskCard,
	mostFrequent,
	normalizeSpaces,
	reverse,
	slugify,
	splitName,
	template,
	titleCase,
	truncate,
	truncateWords,
	wordCount,
	wordWrap,
} from './tasks'

// #region STR-01
describe('STR-01 reverse', () => {
	it('переворачивает', () => expect(reverse('abc')).toBe('cba'))
	it('пустая строка', () => expect(reverse('')).toBe(''))
	it('кириллица', () => expect(reverse('мир')).toBe('рим'))
	it('не ломает эмодзи', () => expect(reverse('a🙂b')).toBe('b🙂a'))
})
// #endregion

// #region STR-02
describe('STR-02 capitalize', () => {
	it('приводит регистр', () => expect(capitalize('пРИВЕТ')).toBe('Привет'))
	it('пустая строка', () => expect(capitalize('')).toBe(''))
	it('один символ', () => expect(capitalize('a')).toBe('A'))
})
// #endregion

// #region STR-03
describe('STR-03 countVowels', () => {
	it('кириллица', () => expect(countVowels('Привет')).toBe(2))
	it('латиница в верхнем регистре', () => expect(countVowels('HELLO')).toBe(2))
	it('без гласных', () => expect(countVowels('гдж')).toBe(0))
	it('ё считается', () => expect(countVowels('ёж')).toBe(1))
})
// #endregion

// #region STR-04
describe('STR-04 isPalindrome', () => {
	it('фраза с пробелами и регистром', () => expect(isPalindrome('А роза упала на лапу Азора')).toBe(true))
	it('не палиндром', () => expect(isPalindrome('привет')).toBe(false))
	it('пустая строка', () => expect(isPalindrome('')).toBe(true))
	it('латиница со знаками', () => expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true))
})
// #endregion

// #region STR-05
describe('STR-05 truncate', () => {
	it('обрезает с многоточием', () => expect(truncate('привет мир', 6)).toBe('приве…'))
	it('короче лимита', () => expect(truncate('да', 10)).toBe('да'))
	it('ровно по лимиту', () => expect(truncate('привет', 6)).toBe('привет'))
	it('длина результата не превышает лимит', () => expect(truncate('абвгдежз', 4).length).toBe(4))
})
// #endregion

// #region STR-06
describe('STR-06 truncateWords', () => {
	it('не рвёт слово', () => expect(truncateWords('раз два три четыре', 11)).toBe('раз два…'))
	it('текст короче лимита', () => expect(truncateWords('раз два', 20)).toBe('раз два'))
	it('первое слово не влезло — режем по символам', () =>
		expect(truncateWords('оченьдлинноеслово да', 5)).toBe('очен…'))
})
// #endregion

// #region STR-07
describe('STR-07 titleCase', () => {
	it('каждое слово с заглавной', () => expect(titleCase('иван да марья')).toBe('Иван Да Марья'))
	it('одно слово', () => expect(titleCase('привет')).toBe('Привет'))
})
// #endregion

// #region STR-08
describe('STR-08 initials', () => {
	it('обычное имя', () => expect(initials('Иван Петров')).toBe('ИП'))
	it('лишние пробелы', () => expect(initials('  анна   сергеевна ')).toBe('АС'))
	it('три слова', () => expect(initials('Иванов Иван Иванович')).toBe('ИИИ'))
})
// #endregion

// #region STR-09
describe('STR-09 maskCard', () => {
	it('шестнадцать цифр', () => expect(maskCard('1234567812345678')).toBe('**** **** **** 5678'))
	it('только последние четыре видны', () => expect(maskCard('1234567812345678')).toContain('5678'))
})
// #endregion

// #region STR-10
describe('STR-10 isAnagram', () => {
	it('анаграмма с разным регистром', () => expect(isAnagram('Тесла', 'Салет')).toBe(true))
	it('не анаграмма', () => expect(isAnagram('abc', 'abd')).toBe(false))
	it('разная длина', () => expect(isAnagram('ab', 'abc')).toBe(false))
	it('пробелы не важны', () => expect(isAnagram('а б', 'ба')).toBe(true))
})
// #endregion

// #region STR-11
describe('STR-11 wordCount', () => {
	it('лишние пробелы', () => expect(wordCount('  раз  два три ')).toBe(3))
	it('пустая строка', () => expect(wordCount('')).toBe(0))
	it('только пробелы', () => expect(wordCount('   ')).toBe(0))
	it('перенос строки — тоже разделитель', () => expect(wordCount('раз\nдва')).toBe(2))
})
// #endregion

// #region STR-12
describe('STR-12 formatPhone', () => {
	it('одиннадцать цифр', () => expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67'))
	it('с мусором между цифрами', () => expect(formatPhone('7 999 123-45-67')).toBe('+7 (999) 123-45-67'))
	it('не то количество цифр — вернуть как есть', () => expect(formatPhone('123')).toBe('123'))
})
// #endregion

// #region STR-13
describe('STR-13 mostFrequent', () => {
	it('явный лидер', () => expect(mostFrequent('abbccc')).toBe('c'))
	it('при равенстве первый встреченный', () => expect(mostFrequent('aab b')).toBe('a'))
	it('один символ', () => expect(mostFrequent('z')).toBe('z'))
})
// #endregion

// #region STR-14
describe('STR-14 slugify', () => {
	it('транслитерация и знаки', () => expect(slugify('Привет, Мир!')).toBe('privet-mir'))
	it('щ и края', () => expect(slugify('  Щи да каша  ')).toBe('schi-da-kasha'))
	it('цифры и тире', () => expect(slugify('React 19 — что нового')).toBe('react-19-chto-novogo'))
	it('уже латиница', () => expect(slugify('Hello World')).toBe('hello-world'))
	it('мягкий знак исчезает', () => expect(slugify('Соль')).toBe('sol'))
})
// #endregion

// #region STR-15
describe('STR-15 camelToKebab', () => {
	it('две части', () => expect(camelToKebab('backgroundColor')).toBe('background-color'))
	it('без заглавных', () => expect(camelToKebab('color')).toBe('color'))
	it('три части', () => expect(camelToKebab('borderTopWidth')).toBe('border-top-width'))
})
// #endregion

// #region STR-16
describe('STR-16 kebabToCamel', () => {
	it('две части', () => expect(kebabToCamel('background-color')).toBe('backgroundColor'))
	it('три части', () => expect(kebabToCamel('data-user-id')).toBe('dataUserId'))
	it('без дефисов', () => expect(kebabToCamel('color')).toBe('color'))
	it('обратимость с camelToKebab', () => expect(kebabToCamel(camelToKebab('borderTopWidth'))).toBe('borderTopWidth'))
})
// #endregion

// #region STR-17
describe('STR-17 leftPad', () => {
	it('дополняет нулями', () => expect(leftPad('7', 3, '0')).toBe('007'))
	it('длиннее лимита не трогает', () => expect(leftPad('1234', 2)).toBe('1234'))
	it('по умолчанию пробел', () => expect(leftPad('a', 3)).toBe('  a'))
})
// #endregion

// #region STR-18
describe('STR-18 escapeHtml', () => {
	it('теги и кавычки', () => expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;'))
	it('амперсанд не экранируется дважды', () => expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;'))
	it('одинарная кавычка', () => expect(escapeHtml("it's")).toBe('it&#39;s'))
	it('обычный текст не меняется', () => expect(escapeHtml('привет')).toBe('привет'))
})
// #endregion

// #region STR-19
describe('STR-19 template', () => {
	it('подставляет значение', () => expect(template('Привет, {{name}}!', { name: 'Аня' })).toBe('Привет, Аня!'))
	it('пробелы внутри скобок', () => expect(template('{{ name }}', { name: 'Аня' })).toBe('Аня'))
	it('несколько ключей', () => expect(template('{{a}}-{{b}}', { a: 1, b: 2 })).toBe('1-2'))
	it('отсутствующий ключ даёт пустоту', () => expect(template('[{{nope}}]', {})).toBe('[]'))
})
// #endregion

// #region STR-20
describe('STR-20 countSubstring', () => {
	it('без перекрытий', () => expect(countSubstring('abababa', 'aba')).toBe(2))
	it('одиночный символ', () => expect(countSubstring('aaa', 'a')).toBe(3))
	it('пустая игла', () => expect(countSubstring('abc', '')).toBe(0))
	it('нет совпадений', () => expect(countSubstring('abc', 'z')).toBe(0))
})
// #endregion

// #region STR-21
describe('STR-21 longestCommonPrefix', () => {
	it('обычный случай', () => expect(longestCommonPrefix(['flower', 'flow', 'flight'])).toBe('fl'))
	it('нет общего', () => expect(longestCommonPrefix(['a', 'b'])).toBe(''))
	it('пустой список', () => expect(longestCommonPrefix([])).toBe(''))
	it('одно слово', () => expect(longestCommonPrefix(['один'])).toBe('один'))
	it('полное совпадение', () => expect(longestCommonPrefix(['раз', 'раз'])).toBe('раз'))
})
// #endregion

// #region STR-22
describe('STR-22 compress', () => {
	it('сжимает серии', () => expect(compress('aaabb')).toBe('a3b2'))
	it('одиночные без цифр', () => expect(compress('abc')).toBe('abc'))
	it('серии вразнобой', () => expect(compress('aabaa')).toBe('a2ba2'))
	it('пустая строка', () => expect(compress('')).toBe(''))
})
// #endregion

// #region STR-23
describe('STR-23 isBalanced', () => {
	it('все типы скобок', () => expect(isBalanced('([]{})')).toBe(true))
	it('перепутанный порядок', () => expect(isBalanced('(]')).toBe(false))
	it('незакрытая', () => expect(isBalanced('(()')).toBe(false))
	it('лишняя закрывающая', () => expect(isBalanced('())')).toBe(false))
	it('пустая строка', () => expect(isBalanced('')).toBe(true))
	it('текст вокруг скобок', () => expect(isBalanced('fn(a[0], { b: 1 })')).toBe(true))
})
// #endregion

// #region STR-24
describe('STR-24 highlight', () => {
	it('оборачивает совпадение', () => expect(highlight('Привет мир', 'мир')).toBe('Привет <mark>мир</mark>'))
	it('сохраняет исходный регистр', () =>
		expect(highlight('Мир и МИР', 'мир')).toBe('<mark>Мир</mark> и <mark>МИР</mark>'))
	it('пустой запрос', () => expect(highlight('текст', '')).toBe('текст'))
	it('спецсимволы не ломают регулярку', () => expect(highlight('a(b)c', '(b)')).toBe('a<mark>(b)</mark>c'))
})
// #endregion

// #region STR-25
describe('STR-25 formatBytes', () => {
	it('ноль', () => expect(formatBytes(0)).toBe('0 Б'))
	it('ровно килобайт', () => expect(formatBytes(1024)).toBe('1 КБ'))
	it('полтора килобайта', () => expect(formatBytes(1536)).toBe('1.5 КБ'))
	it('мегабайты', () => expect(formatBytes(1234567)).toBe('1.18 МБ'))
	it('байты', () => expect(formatBytes(512)).toBe('512 Б'))
})
// #endregion

// #region STR-26
describe('STR-26 normalizeSpaces', () => {
	it('схлопывает и обрезает', () => expect(normalizeSpaces('  раз\n\n  два  ')).toBe('раз два'))
	it('уже нормальная строка', () => expect(normalizeSpaces('раз два')).toBe('раз два'))
	it('только пробелы', () => expect(normalizeSpaces('   ')).toBe(''))
})
// #endregion

// #region STR-27
describe('STR-27 splitName', () => {
	it('полное ФИО', () =>
		expect(splitName('Иванов Иван Иванович')).toEqual({ last: 'Иванов', first: 'Иван', middle: 'Иванович' }))
	it('без отчества', () =>
		expect(splitName('Иванов Иван')).toEqual({ last: 'Иванов', first: 'Иван', middle: '' }))
	it('только фамилия', () => expect(splitName('Иванов')).toEqual({ last: 'Иванов', first: '', middle: '' }))
	it('лишние пробелы', () =>
		expect(splitName('  Иванов   Иван  ')).toEqual({ last: 'Иванов', first: 'Иван', middle: '' }))
})
// #endregion

// #region STR-28
describe('STR-28 wordWrap', () => {
	it('переносит по словам', () => expect(wordWrap('раз два три', 7)).toEqual(['раз два', 'три']))
	it('длинное слово занимает строку целиком', () => expect(wordWrap('очень-длинное', 5)).toEqual(['очень-длинное']))
	it('всё влезает в одну строку', () => expect(wordWrap('раз два', 20)).toEqual(['раз два']))
	it('пустой текст', () => expect(wordWrap('', 10)).toEqual([]))
	it('ни одна строка не длиннее ширины, если слова влезают', () => {
		const lines = wordWrap('аа бб вв гг дд', 5)
		expect(lines.every(line => line.length <= 5)).toBe(true)
	})
})
// #endregion

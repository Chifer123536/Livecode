import { describe, expect, it } from 'vitest'
import {
	avatarInitials,
	dayLabel,
	formatAddress,
	formatCompact,
	formatDate,
	formatDateLong,
	formatDateRange,
	formatDelta,
	formatDuration,
	formatFileName,
	formatList,
	formatNumber,
	formatOrdinal,
	formatPercent,
	formatPhoneInput,
	formatPrice,
	formatRange,
	formatRating,
	formatTime,
	plural,
	timeAgo,
	pluralize,
	type Forms,
} from './tasks'

const GOODS: Forms = ['товар', 'товара', 'товаров']
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const NOW = new Date(2026, 2, 5, 12, 0, 0).getTime()

// #region FMT-01
describe('FMT-01 formatPrice', () => {
	it('разделяет тысячи', () => expect(formatPrice(1234567)).toBe('1 234 567 ₽'))
	it('меньше тысячи', () => expect(formatPrice(999)).toBe('999 ₽'))
	it('ровно тысяча', () => expect(formatPrice(1000)).toBe('1 000 ₽'))
	it('ноль', () => expect(formatPrice(0)).toBe('0 ₽'))
	it('дробная часть отбрасывается', () => expect(formatPrice(1500.9)).toBe('1 500 ₽'))
	it('разделитель — обычный пробел, а не неразрывный', () =>
		expect(formatPrice(1000).includes(' ')).toBe(false))
})
// #endregion

// #region FMT-02
describe('FMT-02 formatNumber', () => {
	it('с дробной частью', () => expect(formatNumber(1234567.25)).toBe('1 234 567,25'))
	it('отрицательное', () => expect(formatNumber(-1500)).toBe('-1 500'))
	it('маленькое число', () => expect(formatNumber(42)).toBe('42'))
	it('ноль', () => expect(formatNumber(0)).toBe('0'))
})
// #endregion

// #region FMT-03
describe('FMT-03 plural', () => {
	it('один', () => expect(plural(1, GOODS)).toBe('товар'))
	it('два', () => expect(plural(2, GOODS)).toBe('товара'))
	it('пять', () => expect(plural(5, GOODS)).toBe('товаров'))
	it('одиннадцать — третья форма', () => expect(plural(11, GOODS)).toBe('товаров'))
	it('двенадцать — третья форма', () => expect(plural(12, GOODS)).toBe('товаров'))
	it('четырнадцать — третья форма', () => expect(plural(14, GOODS)).toBe('товаров'))
	it('двадцать один', () => expect(plural(21, GOODS)).toBe('товар'))
	it('сто двенадцать', () => expect(plural(112, GOODS)).toBe('товаров'))
	it('ноль', () => expect(plural(0, GOODS)).toBe('товаров'))
	it('отрицательное', () => expect(plural(-1, GOODS)).toBe('товар'))
})
// #endregion

// #region FMT-04
describe('FMT-04 pluralize', () => {
	it('с числом', () => expect(pluralize(5, GOODS)).toBe('5 товаров'))
	it('единственное', () => expect(pluralize(1, GOODS)).toBe('1 товар'))
})
// #endregion

// #region FMT-05
describe('FMT-05 formatPercent', () => {
	it('дробная доля', () => expect(formatPercent(0.1234)).toBe('12,3%'))
	it('сто процентов', () => expect(formatPercent(1)).toBe('100%'))
	it('ноль', () => expect(formatPercent(0)).toBe('0%'))
	it('половина', () => expect(formatPercent(0.5)).toBe('50%'))
})
// #endregion

// #region FMT-06
describe('FMT-06 formatDelta', () => {
	it('рост со знаком плюс', () => expect(formatDelta(12)).toBe('+12%'))
	it('падение', () => expect(formatDelta(-3)).toBe('-3%'))
	it('ноль без знака', () => expect(formatDelta(0)).toBe('0%'))
})
// #endregion

// #region FMT-07
describe('FMT-07 formatDate', () => {
	it('дополняет нулями', () => expect(formatDate(new Date(2026, 2, 5))).toBe('05.03.2026'))
	it('двузначные день и месяц', () => expect(formatDate(new Date(2025, 11, 31))).toBe('31.12.2025'))
})
// #endregion

// #region FMT-08
describe('FMT-08 formatDateLong', () => {
	it('текущий год без года', () => expect(formatDateLong(new Date(2026, 2, 5), 2026)).toBe('5 марта'))
	it('другой год с годом', () => expect(formatDateLong(new Date(2025, 11, 31), 2026)).toBe('31 декабря 2025'))
	it('родительный падеж месяца', () => expect(formatDateLong(new Date(2026, 4, 1), 2026)).toBe('1 мая'))
})
// #endregion

// #region FMT-09
describe('FMT-09 formatTime', () => {
	it('дополняет нулями', () => expect(formatTime(new Date(2026, 2, 5, 9, 5))).toBe('09:05'))
	it('полночь', () => expect(formatTime(new Date(2026, 2, 5, 0, 0))).toBe('00:00'))
})
// #endregion

// #region FMT-10
describe('FMT-10 timeAgo', () => {
	it('только что', () => expect(timeAgoAt(30_000)).toBe('только что'))
	it('минуты со склонением', () => {
		expect(timeAgoAt(MINUTE)).toBe('1 минуту назад')
		expect(timeAgoAt(2 * MINUTE)).toBe('2 минуты назад')
		expect(timeAgoAt(5 * MINUTE)).toBe('5 минут назад')
	})
	it('часы', () => {
		expect(timeAgoAt(HOUR)).toBe('1 час назад')
		expect(timeAgoAt(2 * HOUR)).toBe('2 часа назад')
	})
	it('дни', () => {
		expect(timeAgoAt(DAY)).toBe('1 день назад')
		expect(timeAgoAt(3 * DAY)).toBe('3 дня назад')
	})
	it('давнее — обычная дата', () => {
		const long = new Date(2026, 0, 1).getTime()
		expect(timeAgo(long, NOW)).toBe('01.01.2026')
	})
})

function timeAgoAt(ago: number): string {
	return timeAgo(NOW - ago, NOW)
}
// #endregion

// #region FMT-11
describe('FMT-11 formatDuration', () => {
	it('только секунды', () => expect(formatDuration(30)).toBe('30 с'))
	it('минуты и секунды', () => expect(formatDuration(65)).toBe('1 мин 5 с'))
	it('ровно час', () => expect(formatDuration(3600)).toBe('1 ч'))
	it('максимум две единицы', () => expect(formatDuration(3905)).toBe('1 ч 5 мин'))
	it('ноль', () => expect(formatDuration(0)).toBe('0 с'))
})
// #endregion

// #region FMT-12
describe('FMT-12 formatDateRange', () => {
	it('внутри одного месяца', () =>
		expect(formatDateRange(new Date(2026, 2, 5), new Date(2026, 2, 7))).toBe('5–7 марта'))
	it('разные месяцы одного года', () =>
		expect(formatDateRange(new Date(2026, 1, 28), new Date(2026, 2, 2))).toBe('28 февраля – 2 марта'))
	it('разные годы', () =>
		expect(formatDateRange(new Date(2025, 11, 28), new Date(2026, 0, 2))).toBe('28 декабря 2025 – 2 января 2026'))
})
// #endregion

// #region FMT-13
describe('FMT-13 dayLabel', () => {
	const now = new Date(2026, 2, 5, 12, 0)

	it('сегодня', () => expect(dayLabel(new Date(2026, 2, 5, 23, 59), now)).toBe('сегодня'))
	it('вчера', () => expect(dayLabel(new Date(2026, 2, 4, 1, 0), now)).toBe('вчера'))
	it('завтра', () => expect(dayLabel(new Date(2026, 2, 6, 0, 1), now)).toBe('завтра'))
	it('остальное — дата', () => expect(dayLabel(new Date(2026, 2, 1), now)).toBe('01.03.2026'))
	it('сравнение по календарю, а не по разнице', () =>
		expect(dayLabel(new Date(2026, 2, 4, 23, 59), new Date(2026, 2, 5, 0, 1))).toBe('вчера'))
})
// #endregion

// #region FMT-14
describe('FMT-14 formatCompact', () => {
	it('меньше тысячи', () => expect(formatCompact(999)).toBe('999'))
	it('ровно тысяча', () => expect(formatCompact(1000)).toBe('1 тыс.'))
	it('с десятыми', () => expect(formatCompact(1200)).toBe('1,2 тыс.'))
	it('миллионы', () => expect(formatCompact(1500000)).toBe('1,5 млн'))
	it('миллиарды', () => expect(formatCompact(2e9)).toBe('2 млрд'))
})
// #endregion

// #region FMT-15
describe('FMT-15 formatOrdinal', () => {
	it('третий', () => expect(formatOrdinal(3)).toBe('3-й'))
	it('сотый', () => expect(formatOrdinal(100)).toBe('100-й'))
})
// #endregion

// #region FMT-16
describe('FMT-16 formatRating', () => {
	it('целое с нулём', () => expect(formatRating(4)).toBe('4,0'))
	it('округление', () => expect(formatRating(4.26)).toBe('4,3'))
	it('ноль', () => expect(formatRating(0)).toBe('0,0'))
})
// #endregion

// #region FMT-17
describe('FMT-17 formatList', () => {
	it('три элемента', () => expect(formatList(['а', 'б', 'в'])).toBe('а, б и в'))
	it('два элемента', () => expect(formatList(['а', 'б'])).toBe('а и б'))
	it('один элемент', () => expect(formatList(['а'])).toBe('а'))
	it('пустой список', () => expect(formatList([])).toBe(''))
})
// #endregion

// #region FMT-18
describe('FMT-18 formatRange', () => {
	it('обе границы', () => expect(formatRange(100, 500)).toBe('от 100 до 500 ₽'))
	it('только нижняя', () => expect(formatRange(100, null)).toBe('от 100 ₽'))
	it('только верхняя', () => expect(formatRange(null, 500)).toBe('до 500 ₽'))
	it('обе пустые', () => expect(formatRange(null, null)).toBe(''))
	it('одинаковые границы', () => expect(formatRange(100, 100)).toBe('100 ₽'))
	it('ноль как граница не теряется', () => expect(formatRange(0, 500)).toBe('от 0 до 500 ₽'))
})
// #endregion

// #region FMT-19
describe('FMT-19 formatAddress', () => {
	it('полный адрес', () =>
		expect(formatAddress({ city: 'Москва', street: 'Ленина', house: '5', flat: '10' })).toBe(
			'Москва, ул. Ленина, д. 5, кв. 10'
		))
	it('только город', () =>
		expect(formatAddress({ city: 'Тверь', street: '', house: '', flat: '' })).toBe('Тверь'))
	it('без квартиры', () =>
		expect(formatAddress({ city: 'Тверь', street: 'Мира', house: '1', flat: '' })).toBe(
			'Тверь, ул. Мира, д. 1'
		))
})
// #endregion

// #region FMT-20
describe('FMT-20 formatPhoneInput', () => {
	it('пустой ввод', () => expect(formatPhoneInput('')).toBe(''))
	it('одна цифра', () => expect(formatPhoneInput('7')).toBe('+7'))
	it('код города не закрыт', () => expect(formatPhoneInput('7999')).toBe('+7 (999'))
	it('начало номера', () => expect(formatPhoneInput('79991')).toBe('+7 (999) 1'))
	it('полный номер', () => expect(formatPhoneInput('79991234567')).toBe('+7 (999) 123-45-67'))
	it('лишние символы выбрасываются', () => expect(formatPhoneInput('+7 (999)')).toBe('+7 (999'))
	it('лишние цифры отсекаются', () => expect(formatPhoneInput('799912345679999')).toBe('+7 (999) 123-45-67'))
})
// #endregion

// #region FMT-21
describe('FMT-21 formatFileName', () => {
	it('обрезает середину, сохраняя расширение', () =>
		expect(formatFileName('документ_очень_длинный.pdf', 15)).toBe('документ_о….pdf'))
	it('короткое имя не трогает', () => expect(formatFileName('мало.txt', 20)).toBe('мало.txt'))
	it('результат не длиннее лимита', () =>
		expect(formatFileName('очень_длинное_название.docx', 18).length).toBeLessThanOrEqual(18))
	it('имя без расширения', () => expect(formatFileName('безрасширениядлинное', 10)).toBe('безрасшир…'))
})
// #endregion

// #region FMT-22
describe('FMT-22 avatarInitials', () => {
	it('фамилия и имя', () => expect(avatarInitials('Иванов Иван')).toBe('ИИ'))
	it('одно слово', () => expect(avatarInitials('Иванов')).toBe('И'))
	it('пустая строка', () => expect(avatarInitials('   ')).toBe('?'))
	it('три слова — только две буквы', () => expect(avatarInitials('Иванов Иван Иванович')).toBe('ИИ'))
})
// #endregion

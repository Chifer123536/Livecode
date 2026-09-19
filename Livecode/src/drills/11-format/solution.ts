/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 11. Открывать только после своей попытки.
 */

/** Месяцы в родительном падеже: «5 марта», а не «5 март». */
const MONTHS_GENITIVE = [
	'января',
	'февраля',
	'марта',
	'апреля',
	'мая',
	'июня',
	'июля',
	'августа',
	'сентября',
	'октября',
	'ноября',
	'декабря',
]

const pad2 = (value: number): string => String(value).padStart(2, '0')

/** Разделитель тысяч через регулярку с ретроспективой по границам групп из трёх цифр. */
const groupThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// #region FMT-01 | Цена
/**
 * \B(?=(\d{3})+(?!\d)) — позиция НЕ на границе слова, после которой идёт
 * кратное трём количество цифр и дальше не цифра. Туда и вставляется пробел.
 * toLocaleString('ru-RU') сделал бы то же самое, но вставил НЕРАЗРЫВНЫЙ пробел (U+00A0),
 * и сравнение строк в тестах внезапно перестанет работать.
 */
export const formatPrice = (value: number): string => `${groupThousands(String(Math.trunc(value)))} ₽`
// #endregion

// #region FMT-02 | Число с разделителями
/**
 * Разделяем на целую и дробную части: группировать надо только целую.
 * Знак минуса тоже нельзя отдавать регулярке — он не цифра и группы не портит,
 * но аккуратнее отделить его явно.
 */
export const formatNumber = (value: number): string => {
	const sign = value < 0 ? '-' : ''
	const [whole, fraction] = Math.abs(value).toString().split('.')
	const grouped = groupThousands(whole)
	return sign + (fraction ? `${grouped},${fraction}` : grouped)
}
// #endregion

// #region FMT-03 | Склонение
/**
 * Порядок проверок критичен: сначала 11-14, иначе одиннадцать уйдёт в форму «товар».
 * Правило русского языка: 11-14 — всегда третья форма, дальше смотрим последнюю цифру.
 */
export type Forms = [string, string, string]

export const plural = (n: number, forms: Forms): string => {
	const abs = Math.abs(n)
	const mod100 = abs % 100
	const mod10 = abs % 10

	if (mod100 >= 11 && mod100 <= 14) return forms[2]
	if (mod10 === 1) return forms[0]
	if (mod10 >= 2 && mod10 <= 4) return forms[1]
	return forms[2]
}
// #endregion

// #region FMT-04 | Число со словом
export const pluralize = (n: number, forms: Forms): string => `${n} ${plural(n, forms)}`
// #endregion

// #region FMT-05 | Проценты
/**
 * Math.round(x * 10) / 10 вместо toFixed(1): toFixed вернёт строку с хвостовым нулём,
 * а нам нужно '100%', а не '100.0%'.
 */
export const formatPercent = (fraction: number): string => {
	const rounded = Math.round(fraction * 1000) / 10
	return `${String(rounded).replace('.', ',')}%`
}
// #endregion

// #region FMT-06 | Изменение со знаком
/** Плюс добавляется вручную: у чисел он не печатается, а пользователю нужен. */
export const formatDelta = (percent: number): string => `${percent > 0 ? '+' : ''}${percent}%`
// #endregion

// #region FMT-07 | Дата цифрами
/**
 * getMonth() возвращает индекс с нуля — плюс один обязателен.
 * Используются локальные геттеры: дата, созданная как new Date(2026, 2, 5),
 * тоже локальная, поэтому часовой пояс на результат не влияет.
 */
export const formatDate = (date: Date): string =>
	`${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`
// #endregion

// #region FMT-08 | Дата словами
/** Год показываем только когда он отличается от текущего — так короче и читаемее. */
export const formatDateLong = (date: Date, currentYear: number): string => {
	const base = `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`
	return date.getFullYear() === currentYear ? base : `${base} ${date.getFullYear()}`
}
// #endregion

// #region FMT-09 | Время
export const formatTime = (date: Date): string => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
// #endregion

// #region FMT-10 | Сколько времени прошло
/**
 * Пороги идут от меньшего к большему, первый подошедший выигрывает.
 * Склонение обязательно: «2 часов назад» сразу выдаёт наспех написанный код.
 * В проде это Intl.RelativeTimeFormat('ru') — он умеет и склонения, и другие языки.
 */
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const timeAgo = (timestamp: number, now: number): string => {
	const diff = now - timestamp

	if (diff < MINUTE) return 'только что'
	if (diff < HOUR) {
		const minutes = Math.floor(diff / MINUTE)
		return `${minutes} ${plural(minutes, ['минуту', 'минуты', 'минут'])} назад`
	}
	if (diff < DAY) {
		const hours = Math.floor(diff / HOUR)
		return `${hours} ${plural(hours, ['час', 'часа', 'часов'])} назад`
	}
	if (diff < 7 * DAY) {
		const days = Math.floor(diff / DAY)
		return `${days} ${plural(days, ['день', 'дня', 'дней'])} назад`
	}
	return formatDate(new Date(timestamp))
}
// #endregion

// #region FMT-11 | Длительность
/**
 * Собираем все ненулевые части и берём первые две. Нулевые пропускаем,
 * иначе получится «1 ч 0 мин 0 с» — формально верно, читать невозможно.
 * Отдельный случай для нуля: иначе вернётся пустая строка.
 */
export const formatDuration = (totalSeconds: number): string => {
	if (totalSeconds <= 0) return '0 с'

	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const parts = [
		[hours, 'ч'],
		[minutes, 'мин'],
		[seconds, 'с'],
	] as const

	return parts
		.filter(([value]) => value > 0)
		.slice(0, 2)
		.map(([value, unit]) => `${value} ${unit}`)
		.join(' ')
}
// #endregion

// #region FMT-12 | Диапазон дат
/**
 * Три ветки по убыванию общности: разные годы, разные месяцы, один месяц.
 * Типографика важна: внутри месяца тире без пробелов («5–7 марта»),
 * между месяцами — с пробелами. Это не придирка, а то, что заметит дизайнер.
 */
export const formatDateRange = (from: Date, to: Date): string => {
	const sameYear = from.getFullYear() === to.getFullYear()
	const sameMonth = sameYear && from.getMonth() === to.getMonth()

	if (sameMonth) return `${from.getDate()}–${to.getDate()} ${MONTHS_GENITIVE[from.getMonth()]}`

	const left = `${from.getDate()} ${MONTHS_GENITIVE[from.getMonth()]}${sameYear ? '' : ` ${from.getFullYear()}`}`
	const right = `${to.getDate()} ${MONTHS_GENITIVE[to.getMonth()]}${sameYear ? '' : ` ${to.getFullYear()}`}`
	return `${left} – ${right}`
}
// #endregion

// #region FMT-13 | Человеческая метка дня
/**
 * Сравнивать надо КАЛЕНДАРНЫЕ дни, а не разницу в миллисекундах:
 * 23:59 и 00:01 отличаются на две минуты, но это разные дни.
 * Приём: обнулить время и сравнить полученные даты.
 */
const startOfDay = (date: Date): number =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

export const dayLabel = (date: Date, now: Date): string => {
	const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / DAY)

	if (diffDays === 0) return 'сегодня'
	if (diffDays === -1) return 'вчера'
	if (diffDays === 1) return 'завтра'
	return formatDate(date)
}
// #endregion

// #region FMT-14 | Компактное число
/**
 * Идём от большего порога к меньшему. Округление до одного знака,
 * хвостовой ноль убираем, точку меняем на запятую.
 */
export const formatCompact = (value: number): string => {
	const steps: Array<[number, string]> = [
		[1e9, 'млрд'],
		[1e6, 'млн'],
		[1e3, 'тыс.'],
	]

	for (const [limit, unit] of steps) {
		if (Math.abs(value) >= limit) {
			const short = Math.round((value / limit) * 10) / 10
			return `${String(short).replace('.', ',')} ${unit}`
		}
	}
	return String(value)
}
// #endregion

// #region FMT-15 | Порядковое числительное
/** В мужском роде именительного падежа окончание всегда -й: 1-й, 2-й, 100-й. */
export const formatOrdinal = (n: number): string => `${n}-й`
// #endregion

// #region FMT-16 | Рейтинг
/** Здесь toFixed(1) как раз уместен: хвостовой ноль нужен, «4,0» выглядит ровнее «4». */
export const formatRating = (value: number): string => value.toFixed(1).replace('.', ',')
// #endregion

// #region FMT-17 | Перечисление
/** slice(0, -1) отделяет всё, кроме последнего. Intl.ListFormat делает это штатно. */
export const formatList = (items: string[]): string => {
	if (items.length === 0) return ''
	if (items.length === 1) return items[0]
	return `${items.slice(0, -1).join(', ')} и ${items.at(-1)}`
}
// #endregion

// #region FMT-18 | Диапазон цен
/**
 * Четыре ветки. Проверять надо на null, а НЕ на truthy:
 * условие `if (from)` съест ноль, и «от 0 ₽» превратится в пустоту.
 */
export const formatRange = (from: number | null, to: number | null): string => {
	if (from === null && to === null) return ''
	if (from !== null && to !== null) {
		return from === to ? `${formatPrice(from)}` : `от ${groupThousands(String(from))} до ${formatPrice(to)}`
	}
	if (from !== null) return `от ${formatPrice(from)}`
	return `до ${formatPrice(to as number)}`
}
// #endregion

// #region FMT-19 | Адрес из частей
/** Собираем массив кусочков, отсеиваем пустые, склеиваем. Никаких вложенных тернарников. */
export type Address = { city: string; street: string; house: string; flat: string }

export const formatAddress = (address: Address): string =>
	[
		address.city.trim(),
		address.street.trim() && `ул. ${address.street.trim()}`,
		address.house.trim() && `д. ${address.house.trim()}`,
		address.flat.trim() && `кв. ${address.flat.trim()}`,
	]
		.filter(Boolean)
		.join(', ')
// #endregion

// #region FMT-20 | Маска телефона при вводе
/**
 * Маска строится накопительно: каждый следующий кусок добавляется,
 * только когда цифр действительно хватает. Иначе пользователь увидит
 * «+7 (___) ___-__-__» с дырками или не сможет стереть символ.
 * slice(0, 11) отсекает лишние цифры — вставку из буфера обмена тоже надо пережить.
 */
export const formatPhoneInput = (raw: string): string => {
	const digits = raw.replace(/\D/g, '').slice(0, 11)
	if (digits.length === 0) return ''

	let out = `+${digits[0]}`
	if (digits.length > 1) out += ` (${digits.slice(1, 4)}`
	if (digits.length >= 5) out += `) ${digits.slice(4, 7)}`
	if (digits.length >= 8) out += `-${digits.slice(7, 9)}`
	if (digits.length >= 10) out += `-${digits.slice(9, 11)}`

	return out
}
// #endregion

// #region FMT-21 | Имя файла
/**
 * Обрезать надо СЕРЕДИНУ, а не конец: расширение говорит о типе файла
 * и пользователю нужнее, чем хвост названия.
 * lastIndexOf, а не indexOf: в имени может быть несколько точек.
 */
export const formatFileName = (name: string, max: number): string => {
	if (name.length <= max) return name

	const dot = name.lastIndexOf('.')
	const ext = dot > 0 ? name.slice(dot) : ''
	const base = dot > 0 ? name.slice(0, dot) : name
	const keep = Math.max(1, max - ext.length - 1)

	return `${base.slice(0, keep)}…${ext}`
}
// #endregion

// #region FMT-22 | Инициалы для аватара
/** Запасной символ обязателен: пустой аватар в интерфейсе выглядит как баг. */
export const avatarInitials = (fullName: string): string => {
	const words = fullName.trim().split(/\s+/).filter(Boolean)
	if (words.length === 0) return '?'

	return words
		.slice(0, 2)
		.map(word => word[0].toUpperCase())
		.join('')
}
// #endregion

import { todo } from '../../shared/kit'

/**
 * ПРАВИЛА ПАКА
 * 1. Все функции ЧИСТЫЕ: одинаковый вход — одинаковый выход. Никаких Date.now() внутри,
 *    текущее время всегда приходит аргументом. Иначе такое не протестировать.
 * 2. Десятичный разделитель в русской локали — ЗАПЯТАЯ. Тысячи — пробел.
 * 3. Везде, где есть число и существительное рядом, нужно склонение.
 *    «5 товар» в интерфейсе — мгновенный минус на код-ревью.
 * 4. На собесе после решения скажи, чем это делается в проде: Intl.NumberFormat,
 *    Intl.DateTimeFormat, Intl.RelativeTimeFormat, date-fns. Но уметь руками — обязательно.
 */

// #region FMT-01 | Цена | ★★☆
/**
 * Разделители тысяч обычным пробелом плюс знак рубля.
 * Дробную часть отбрасывать (цены целые).
 *
 *   formatPrice(1234567) → '1 234 567 ₽'
 *   formatPrice(999)     → '999 ₽'
 *   formatPrice(0)       → '0 ₽'
 */
export const formatPrice = (value: number): string => todo()
// #endregion

// #region FMT-02 | Число с разделителями | ★★☆
/**
 * То же, но без валюты и с сохранением дробной части (разделитель — запятая).
 *
 *   formatNumber(1234567.25) → '1 234 567,25'
 *   formatNumber(-1500)      → '-1 500'
 */
export const formatNumber = (value: number): string => todo()
// #endregion

// #region FMT-03 | Склонение | ★★☆
/**
 * Выбрать форму слова по числу. forms = [одна штука, две штуки, пять штук].
 *
 *   plural(1, FORMS)   → 'товар'
 *   plural(2, FORMS)   → 'товара'
 *   plural(5, FORMS)   → 'товаров'
 *   plural(11, FORMS)  → 'товаров'   // 11-14 всегда третья форма
 *   plural(21, FORMS)  → 'товар'
 */
export type Forms = [string, string, string]
export const plural = (n: number, forms: Forms): string => todo()
// #endregion

// #region FMT-04 | Число со словом | ★☆☆
/**
 *   pluralize(5, FORMS) → '5 товаров'
 *   pluralize(1, FORMS) → '1 товар'
 */
export const pluralize = (n: number, forms: Forms): string => todo()
// #endregion

// #region FMT-05 | Проценты | ★★☆
/**
 * Вход — доля от единицы. Округлять до одного знака, хвостовой ноль убирать.
 *
 *   formatPercent(0.1234) → '12,3%'
 *   formatPercent(1)      → '100%'
 *   formatPercent(0)      → '0%'
 */
export const formatPercent = (fraction: number): string => todo()
// #endregion

// #region FMT-06 | Изменение со знаком | ★★☆
/**
 * Знак плюс для роста, минус для падения, ноль без знака.
 *
 *   formatDelta(12)  → '+12%'
 *   formatDelta(-3)  → '-3%'
 *   formatDelta(0)   → '0%'
 */
export const formatDelta = (percent: number): string => todo()
// #endregion

// #region FMT-07 | Дата цифрами | ★★☆
/**
 * Формат ДД.ММ.ГГГГ, всегда по две цифры.
 *
 *   formatDate(new Date(2026, 2, 5)) → '05.03.2026'
 */
export const formatDate = (date: Date): string => todo()
// #endregion

// #region FMT-08 | Дата словами | ★★☆
/**
 * Родительный падеж месяца, без года если год совпадает с текущим.
 *
 *   formatDateLong(new Date(2026, 2, 5), 2026) → '5 марта'
 *   formatDateLong(new Date(2025, 11, 31), 2026) → '31 декабря 2025'
 */
export const formatDateLong = (date: Date, currentYear: number): string => todo()
// #endregion

// #region FMT-09 | Время | ★☆☆
/**
 *   formatTime(new Date(2026, 2, 5, 9, 5)) → '09:05'
 */
export const formatTime = (date: Date): string => todo()
// #endregion

// #region FMT-10 | Сколько времени прошло | ★★★
/**
 * Оба аргумента — метки времени в миллисекундах.
 *   меньше минуты  → 'только что'
 *   меньше часа    → 'N минут назад' (со склонением)
 *   меньше суток   → 'N часов назад'
 *   меньше недели  → 'N дней назад'
 *   дальше         → дата цифрами из FMT-07
 */
export const timeAgo = (timestamp: number, now: number): string => todo()
// #endregion

// #region FMT-11 | Длительность | ★★★
/**
 * Секунды в человеческий вид, максимум ДВЕ единицы, нулевые пропускать.
 *
 *   formatDuration(30)   → '30 с'
 *   formatDuration(65)   → '1 мин 5 с'
 *   formatDuration(3600) → '1 ч'
 *   formatDuration(3905) → '1 ч 5 мин'
 *   formatDuration(0)    → '0 с'
 */
export const formatDuration = (totalSeconds: number): string => todo()
// #endregion

// #region FMT-12 | Диапазон дат | ★★★
/**
 *   один месяц:       '5–7 марта'
 *   разные месяцы:    '28 февраля – 2 марта'
 *   разные годы:      '28 декабря 2025 – 2 января 2026'
 *
 * Внутри месяца используется тире без пробелов, между месяцами — с пробелами.
 */
export const formatDateRange = (from: Date, to: Date): string => todo()
// #endregion

// #region FMT-13 | Человеческая метка дня | ★★☆
/**
 * Сравнение по КАЛЕНДАРНОМУ дню, а не по разнице в миллисекундах.
 *
 *   dayLabel(сегодня, now)  → 'сегодня'
 *   dayLabel(вчера, now)    → 'вчера'
 *   dayLabel(завтра, now)   → 'завтра'
 *   остальное               → '05.03.2026'
 */
export const dayLabel = (date: Date, now: Date): string => todo()
// #endregion

// #region FMT-14 | Компактное число | ★★★
/**
 * Тысячи и миллионы сокращённо, один знак после запятой, хвостовой ноль убирать.
 *
 *   formatCompact(999)      → '999'
 *   formatCompact(1200)     → '1,2 тыс.'
 *   formatCompact(1000)     → '1 тыс.'
 *   formatCompact(1500000)  → '1,5 млн'
 *   formatCompact(2e9)      → '2 млрд'
 */
export const formatCompact = (value: number): string => todo()
// #endregion

// #region FMT-15 | Порядковое числительное | ★☆☆
/**
 * Мужской род, именительный падеж.
 *
 *   formatOrdinal(3) → '3-й'
 */
export const formatOrdinal = (n: number): string => todo()
// #endregion

// #region FMT-16 | Рейтинг | ★☆☆
/**
 * Всегда один знак после запятой, разделитель — запятая.
 *
 *   formatRating(4)    → '4,0'
 *   formatRating(4.26) → '4,3'
 */
export const formatRating = (value: number): string => todo()
// #endregion

// #region FMT-17 | Перечисление | ★★☆
/**
 * Последний элемент присоединяется союзом «и».
 *
 *   formatList(['а', 'б', 'в']) → 'а, б и в'
 *   formatList(['а', 'б'])      → 'а и б'
 *   formatList(['а'])           → 'а'
 *   formatList([])              → ''
 */
export const formatList = (items: string[]): string => todo()
// #endregion

// #region FMT-18 | Диапазон цен | ★★☆
/**
 * Любая граница может отсутствовать.
 *
 *   formatRange(100, 500)  → 'от 100 до 500 ₽'
 *   formatRange(100, null) → 'от 100 ₽'
 *   formatRange(null, 500) → 'до 500 ₽'
 *   formatRange(null, null) → ''
 *   formatRange(100, 100)  → '100 ₽'
 */
export const formatRange = (from: number | null, to: number | null): string => todo()
// #endregion

// #region FMT-19 | Адрес из частей | ★★☆
/**
 * Собрать строку, пропуская пустые части.
 *
 *   formatAddress({ city: 'Москва', street: 'Ленина', house: '5', flat: '10' })
 *     → 'Москва, ул. Ленина, д. 5, кв. 10'
 *   formatAddress({ city: 'Тверь', street: '', house: '', flat: '' }) → 'Тверь'
 */
export type Address = { city: string; street: string; house: string; flat: string }
export const formatAddress = (address: Address): string => todo()
// #endregion

// #region FMT-20 | Маска телефона при вводе | ★★★
/**
 * Форматировать НЕПОЛНЫЙ ввод, чтобы маска росла вместе с набором.
 * Всё, кроме цифр, выбрасывается, лишние цифры отсекаются.
 *
 *   formatPhoneInput('')            → ''
 *   formatPhoneInput('7')           → '+7'
 *   formatPhoneInput('7999')        → '+7 (999'
 *   formatPhoneInput('79991')       → '+7 (999) 1'
 *   formatPhoneInput('79991234567') → '+7 (999) 123-45-67'
 */
export const formatPhoneInput = (raw: string): string => todo()
// #endregion

// #region FMT-21 | Имя файла | ★★★
/**
 * Обрезать середину, сохранив расширение. Короткое имя не трогать.
 *
 *   formatFileName('документ_очень_длинный.pdf', 15) → 'документ_о….pdf'
 *   formatFileName('мало.txt', 20)                   → 'мало.txt'
 */
export const formatFileName = (name: string, max: number): string => todo()
// #endregion

// #region FMT-22 | Инициалы для аватара | ★★☆
/**
 * Две буквы: первая от фамилии, первая от имени. Одно слово — одна буква.
 * Пустая строка → '?'.
 *
 *   avatarInitials('Иванов Иван') → 'ИИ'
 *   avatarInitials('Иванов')      → 'И'
 *   avatarInitials('   ')         → '?'
 */
export const avatarInitials = (fullName: string): string => todo()
// #endregion

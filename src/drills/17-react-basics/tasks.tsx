import type { ReactNode } from 'react'

/**
 * ПРАВИЛА ПАКА
 * 1. Каждая задача — ОДИН приём. Не тащи в неё то, чего не просят.
 * 2. Производное значение (отфильтрованный список, сумма, «всё ли выбрано») НЕ хранится
 *    в useState. Считается в теле рендера. Лишний state = рассинхрон, это главная ошибка джуна.
 * 3. Иммутабельность: state-объекты и массивы обновляются только через новую ссылку.
 * 4. Тесты дёргают компонент как пользователь: ищут по роли, тексту и label.
 *    Поэтому у кнопок должен быть текст, у инпутов — label, htmlFor или aria-label.
 */

// #region RB-01 | Пропс в разметку | ★☆☆
/**
 * Вывести <p>Привет, {name}!</p>.
 * Ровно один абзац, текст полностью совпадает с шаблоном.
 *
 *   <Hello name="мир" /> → «Привет, мир!»
 */
export function Hello({ name }: { name: string }) {
	return <p>заглушка</p>
}
// #endregion

// #region RB-02 | Значение по умолчанию | ★☆☆
/**
 * Бейдж со счётчиком. Если count не передан — считать, что 0.
 * Вывести текст вида «Уведомлений: 0».
 * Значение по умолчанию задать в деструктуризации, не через if внутри.
 */
export function Badge({ count = 0 }: { count?: number }) {
	return <span>заглушка</span>
}
// #endregion

// #region RB-03 | children и деструктуризация | ★☆☆
/**
 * Карточка пользователя: <h3> с именем, <p> с должностью, затем children.
 * children выводить как есть, без обёрток.
 *
 *   <UserCard name="Анна" role="фронтендер"><a href="#">профиль</a></UserCard>
 */
export function UserCard({ name, role, children }: { name: string; role: string; children?: ReactNode }) {
	return <article>заглушка</article>
}
// #endregion

// #region RB-04 | useState | ★☆☆
/**
 * Счётчик: текст «Счёт: N» и кнопка «+1», увеличивающая его на единицу.
 * Начальное значение 0.
 */
export function Counter() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-05 | Условный рендер | ★☆☆
/**
 * Кнопка «Показать» / «Скрыть» и абзац с текстом «Секрет».
 * Пока скрыто — абзаца НЕ ДОЛЖНО БЫТЬ В DOM (не display:none, а именно отсутствие узла).
 * Текст кнопки меняется вместе с состоянием.
 */
export function Toggle() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-06 | Контролируемый инпут | ★☆☆
/**
 * Инпут с подписью «Имя» и абзац под ним, который повторяет введённое.
 * Пока пусто — в абзаце «ничего не введено».
 * Инпут обязан быть контролируемым: value + onChange.
 */
export function EchoInput() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-07 | Список и key | ★☆☆
/**
 * Отрисовать items как <ul><li>. key — сам элемент, он уникален.
 *
 *   <FruitList items={['яблоко', 'груша']} />
 */
export function FruitList({ items }: { items: string[] }) {
	return <ul>заглушка</ul>
}
// #endregion

// #region RB-08 | Пустое состояние | ★☆☆
/**
 * Тот же список, но если items пуст — вместо <ul> показать <p>Список пуст</p>.
 * Пустой <ul> в DOM оставаться не должен.
 */
export function ListWithEmpty({ items }: { items: string[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-09 | Производное значение | ★★☆
/**
 * Чекбокс «только в наличии» фильтрует products.
 * Отфильтрованный список ВЫЧИСЛЯЕТСЯ при рендере — никакого второго useState под него.
 * Под списком — текст «Показано: N».
 */
export type Product = { id: number; title: string; inStock: boolean }
export function StockFilter({ products }: { products: Product[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-10 | Подъём состояния | ★★☆
/**
 * NumberInput — контролируемый инпут БЕЗ собственного состояния: value и onChange приходят сверху.
 * SumBox держит два значения и выводит «Сумма: N». Нечисловой ввод считать нулём.
 * Подписи инпутов: «Первое» и «Второе».
 */
export function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	return <label>заглушка</label>
}
export function SumBox() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-11 | Функциональный setState | ★★☆
/**
 * Счётчик с кнопками «+1» и «+3».
 * «+3» обязана увеличивать на три в ОДНОМ обработчике — три вызова сеттера подряд.
 * Если написать setCount(count + 1) трижды, получится +1. Это и есть задача.
 */
export function BatchCounter() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-12 | Объект в состоянии | ★★☆
/**
 * Форма профиля: поля «Имя» и «Город», оба в ОДНОМ объекте состояния.
 * Один обработчик на оба инпута — через атрибут name.
 * Под формой: «Анна из Москвы» (или «— из —», если пусто).
 */
export function ProfileForm() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-13 | Массив в состоянии | ★★☆
/**
 * Инпут «Тег» + кнопка «Добавить». Теги выводятся списком, у каждого кнопка «Удалить».
 * Пустые строки и пробелы не добавляются, поле очищается после добавления.
 * Массив обновлять иммутабельно.
 * У кнопки удаления должен быть aria-label={`Удалить ${tag}`} — иначе на экране
 * десять одинаковых «Удалить», и ни скринридер, ни тест не поймут, какая из них какая.
 */
export function TagList() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-14 | Форма и preventDefault | ★★☆
/**
 * Форма поиска: инпут с подписью «Запрос» и кнопка «Найти» (type="submit").
 * Сабмит по Enter и по кнопке. При сабмите — вызвать onSearch с обрезанным значением.
 * Пустой запрос не отправлять. Обязателен e.preventDefault().
 */
export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
	return <form>заглушка</form>
}
// #endregion

// #region RB-15 | Контролируемый select | ★★☆
/**
 * Выпадающий список цветов (подпись «Цвет») из COLORS, начальное значение — первый элемент.
 * Под ним абзац «Выбрано: красный».
 */
export const COLORS = ['красный', 'зелёный', 'синий']
export function ColorSelect() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-16 | Группа чекбоксов | ★★☆
/**
 * Чекбоксы по options, выбранные хранятся массивом.
 * Под ними: «Выбрано: a, b» или «Ничего не выбрано».
 * Повторный клик снимает галочку. Порядок выбранных — как в options.
 */
export function CheckboxGroup({ options }: { options: string[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-17 | Вкладки | ★★☆
/**
 * Вкладки по правилам доступности: обёртка role="tablist", кнопки role="tab",
 * у активной aria-selected="true", у остальных "false".
 * Ниже — <p> с содержимым активной вкладки. По умолчанию активна первая.
 *
 *   tabs = [{ id: 'a', title: 'Первая', content: 'Раз' }, ...]
 */
export type Tab = { id: string; title: string; content: string }
export function Tabs({ tabs }: { tabs: Tab[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-18 | Аккордеон | ★★☆
/**
 * Список секций. Клик по заголовку раскрывает секцию и закрывает предыдущую —
 * открытой может быть только одна. Повторный клик по открытой закрывает её.
 * Хранить ОДИН openId, а не флаг в каждой секции.
 * У кнопки-заголовка должен быть aria-expanded, тело секции рендерить только когда открыта.
 */
export type Section = { id: string; title: string; body: string }
export function Accordion({ sections }: { sections: Section[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-19 | Ловушка нуля | ★★☆
/**
 * Показать «Товаров: N», а если count === 0 — ничего не рендерить вообще.
 * Наивное {count && <p>...} отрисует «0» на экране. Задача — не допустить этого.
 */
export function ZeroTrap({ count }: { count: number }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-20 | Статус в человеческий вид | ★★☆
/**
 * Перевести status в текст через объект-словарь, без цепочки if.
 * Неизвестный статус → «Неизвестно».
 * Вывести <span> с текстом и атрибутом data-status={status}.
 *
 *   'new' → 'Новый', 'paid' → 'Оплачен', 'cancelled' → 'Отменён'
 */
export function StatusBadge({ status }: { status: string }) {
	return <span>заглушка</span>
}
// #endregion

// #region RB-21 | useEffect и cleanup | ★★☆
/**
 * Счётчик, который пишет текущее значение в document.title при каждом изменении.
 * При размонтировании вернуть заголовок 'livecode-drills'.
 * Зависимость эффекта — [count].
 */
export function TitleCounter() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-22 | useRef на DOM | ★★☆
/**
 * Инпут (подпись «Поиск») и кнопка «Фокус»: клик переводит фокус в инпут.
 * Только useRef, без document.querySelector.
 */
export function FocusInput() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-23 | Интервал и очистка | ★★★
/**
 * Секундомер: текст «Прошло: N с», кнопки «Старт», «Пауза», «Сброс».
 * setInterval заводить в useEffect и ОБЯЗАТЕЛЬНО чистить в cleanup.
 * id интервала держать в ref, а не в state.
 */
export function Stopwatch() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-24 | Предыдущее значение | ★★★
/**
 * Счётчик, который показывает «Сейчас: N, было: M».
 * Предыдущее значение хранить в useRef и обновлять в useEffect — так оно отстаёт на рендер.
 * До первого изменения «было: —».
 */
export function PrevValue() {
	return <div>заглушка</div>
}
// #endregion

// #region RB-25 | Клик снаружи | ★★★
/**
 * Меню: кнопка «Меню» открывает <ul>. Клик ВНЕ меню закрывает его, клик внутри — нет.
 * Слушатель вешать на document в useEffect (событие mousedown) и снимать в cleanup.
 * Проверять попадание через ref обёртки: ref.current.contains(event.target).
 */
export function DropdownMenu({ items }: { items: string[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RB-26 | key по id, а не по индексу | ★★★
/**
 * Список задач с НЕконтролируемым чекбоксом у каждой (подпись — title) и кнопкой «Удалить первую».
 * key должен быть item.id. С key={index} после удаления первой галочка «переедет»
 * на соседний элемент, потому что React переиспользует DOM-узел по ключу. Тест это ловит.
 */
export type Item = { id: string; title: string }
export function KeyedList({ initial }: { initial: Item[] }) {
	return <div>заглушка</div>
}
// #endregion

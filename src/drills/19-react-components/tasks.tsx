import type { ReactNode } from 'react'

/**
 * ПРАВИЛА ПАКА
 * 1. Это задачи «напиши компонент за 20-30 минут вслух». Сначала проговори структуру
 *    состояния, потом разметку, потом обработчики. Тесты — формальная приёмка.
 * 2. Доступность не украшение: тесты ищут элементы по роли и подписи, как скринридер.
 *    Нет label — нет теста. На собесе за это отдельно хвалят.
 * 3. Любой список — key по стабильному id. Любая подписка — cleanup.
 * 4. Тексты в разметке должны совпадать с условием дословно, иначе тест не найдёт узел.
 */

// #region RC-01 | Список задач | ★★☆
/**
 * Классика номер один. Требования:
 *  - форма: инпут с подписью «Новая задача» и кнопка «Добавить» (submit);
 *  - пустое и из пробелов не добавляется, после добавления поле очищается;
 *  - у каждой задачи чекбокс с подписью = текст задачи и кнопка с aria-label `Удалить ${text}`;
 *  - фильтр: три кнопки «Все», «Активные», «Выполненные», у активной aria-pressed="true";
 *  - счётчик: «Осталось: N»;
 *  - кнопка «Очистить выполненные» (показывать всегда);
 *  - пустой список → <p>Задач нет</p>.
 * Все обновления иммутабельные, key — id.
 */
export function TodoList() {
	return <div>заглушка</div>
}
// #endregion

// #region RC-02 | Поиск с дебаунсом | ★★☆
/**
 * Инпут с подписью «Поиск» фильтрует items по подстроке без учёта регистра.
 * Фильтрация применяется только через `delay` мс тишины (дебаунс).
 * Пока введённое отличается от применённого — показывать <p>Печатает…</p>.
 * Под списком: «Найдено: N». Ничего не нашлось → <p>Ничего не найдено</p>.
 */
export function SearchWithDebounce({ items, delay = 300 }: { items: string[]; delay?: number }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-03 | Загрузка с отменой | ★★★
/**
 * Инпут «Пользователь» + загрузка через переданную функцию search(query, signal).
 * Состояния строго разделены:
 *  - идёт загрузка → <p>Загрузка…</p>;
 *  - ошибка → <p role="alert">{message}</p> и кнопка «Повторить»;
 *  - успех → <ul> с результатами, пусто → <p>Никого не нашли</p>.
 * При смене запроса предыдущий запрос отменяется через AbortController,
 * ответ отменённого запроса в состояние не попадает, AbortError не показывается как ошибка.
 * Пустой запрос не отправляется — показывать <p>Введите запрос</p>.
 */
export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>
export function UserSearch({ search }: { search: SearchFn }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-04 | Форма регистрации | ★★★
/**
 * Поля: «Email», «Пароль», «Повтор пароля». Правила:
 *  - email содержит @ и точку после него;
 *  - пароль минимум 6 символов;
 *  - повтор совпадает с паролем.
 * Ошибка поля показывается ТОЛЬКО после blur или после попытки сабмита,
 * выводится как <p role="alert">{текст}</p>, у поля aria-invalid="true".
 * Кнопка «Зарегистрироваться» задизейблена, пока форма невалидна.
 * Успешный сабмит вызывает onSubmit со значениями и очищает форму.
 * errors — производное от values, а не отдельное состояние.
 */
export type SignupValues = { email: string; password: string; confirm: string }
export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
	return <form>заглушка</form>
}
// #endregion

// #region RC-05 | Модальное окно | ★★★
/**
 * <Modal open onClose title>{children}</Modal> через createPortal в document.body.
 *  - при open === false в DOM ничего нет;
 *  - контейнер: role="dialog", aria-modal="true", aria-labelledby на заголовок;
 *  - закрытие: Escape, клик по оверлею (data-testid="overlay"), кнопка с aria-label «Закрыть»;
 *  - клик по содержимому НЕ закрывает;
 *  - пока открыто, document.body.style.overflow === 'hidden', при закрытии возвращается прежнее;
 *  - слушатель клавиатуры снимается в cleanup.
 */
export function Modal({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean
	onClose: () => void
	title: string
	children?: ReactNode
}) {
	return null
}
// #endregion

// #region RC-06 | Пагинация | ★★☆
/**
 * <Pagination total page onChange /> где total — число страниц.
 *  - кнопки «Назад» и «Вперёд», задизейбленные на краях;
 *  - номера страниц кнопками, у текущей aria-current="page";
 *  - если страниц больше 7 — показывать первую, последнюю, текущую с соседями,
 *    остальное схлопывать в <span>…</span>;
 *  - onChange вызывается с номером страницы.
 */
export function Pagination({ total, page, onChange }: { total: number; page: number; onChange: (page: number) => void }) {
	return <nav>заглушка</nav>
}
// #endregion

// #region RC-07 | Рейтинг звёздами | ★★☆
/**
 * Пять кнопок-звёзд с aria-label «Оценка N».
 *  - клик выставляет оценку и зовёт onChange(N);
 *  - у выставленных звёзд data-active="true";
 *  - наведение подсвечивает звёзды до наведённой, уход мыши возвращает подсветку к оценке;
 *  - повторный клик по той же звезде сбрасывает оценку в 0.
 */
export function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-08 | Автокомплит | ★★★
/**
 * Инпут с подписью «Город» и выпадающий список подсказок из options (подстрока, без регистра).
 *  - список показывается только когда есть введённый текст и есть совпадения;
 *  - ArrowDown/ArrowUp двигают подсветку, у подсвеченного пункта aria-selected="true";
 *  - Enter выбирает подсвеченный пункт: подставляет в инпут, закрывает список, зовёт onSelect;
 *  - Escape закрывает список, не меняя текст;
 *  - клик по пункту работает как Enter;
 *  - пункты — role="option" внутри role="listbox".
 */
export function Autocomplete({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-09 | Корзина | ★★★
/**
 * Список товаров с количеством:
 *  - у каждой строки кнопки aria-label `Меньше ${title}` и `Больше ${title}`, между ними количество;
 *  - количество не опускается ниже 1; кнопка aria-label `Удалить ${title}` убирает строку;
 *  - строка показывает «{title} — {price} ₽ × {qty} = {sum} ₽»;
 *  - внизу «Итого: N ₽» и «Позиций: K»;
 *  - пустая корзина → <p>Корзина пуста</p>.
 */
export type CartLine = { id: string; title: string; price: number; qty: number }
export function ShoppingCart({ initial }: { initial: CartLine[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-10 | Сортируемая таблица | ★★★
/**
 * Таблица по columns и rows. Клик по заголовку сортирует по этому полю:
 * первый клик — по возрастанию, второй — по убыванию, третий — снова по возрастанию.
 *  - заголовки — кнопки внутри <th>, у активной колонки aria-sort="ascending"|"descending",
 *    у остальных aria-sort="none";
 *  - числа сортируются как числа, строки — через localeCompare;
 *  - исходный массив rows не мутируется.
 */
export type Column = { key: string; title: string }
export type Row = Record<string, string | number>
export function SortableTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
	return <table>заглушка</table>
}
// #endregion

// #region RC-11 | Панель фильтров | ★★★
/**
 * Фильтрация каталога по нескольким условиям одновременно:
 *  - инпут «Название» — подстрока без регистра;
 *  - инпуты «Цена от» и «Цена до» — числа, пустая строка означает «без ограничения»;
 *  - чекбокс «Только в наличии»;
 *  - кнопка «Сбросить» возвращает все фильтры в исходное.
 * Результат — <ul> с названиями и <p>Найдено: N</p>.
 * Внимание: чекбокс «в наличии» в выключенном состоянии НЕ должен фильтровать.
 */
export type CatalogItem = { id: number; title: string; price: number; inStock: boolean }
export function FilterPanel({ items }: { items: CatalogItem[] }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-12 | Пошаговая форма | ★★★
/**
 * Три шага: «Контакты» (поле «Имя»), «Адрес» (поле «Город»), «Готово».
 *  - заголовок <h2> с названием текущего шага и <p>Шаг N из 3</p>;
 *  - кнопки «Назад» (задизейблена на первом шаге) и «Далее»;
 *  - «Далее» не работает, пока поле текущего шага пустое;
 *  - на последнем шаге вместо «Далее» кнопка «Отправить», она зовёт onSubmit со всеми данными;
 *  - при возврате назад введённые данные сохраняются.
 */
export type WizardValues = { name: string; city: string }
export function MultiStepForm({ onSubmit }: { onSubmit: (values: WizardValues) => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-13 | Обратный отсчёт | ★★★
/**
 * Таймер от seconds до нуля.
 *  - текст «Осталось: MM:SS» (две цифры на каждую часть);
 *  - кнопки «Старт», «Пауза», «Сброс»;
 *  - на нуле останавливается сам и зовёт onEnd ровно один раз, показывает <p>Время вышло</p>;
 *  - интервал обязательно чистится в cleanup.
 */
export function Countdown({ seconds, onEnd }: { seconds: number; onEnd?: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-14 | Уведомления | ★★★
/**
 * Очередь тостов. Компонент принимает ttl и рендерит кнопку «Показать» —
 * по клику добавляет тост с текстом `Сообщение ${n}` (n — порядковый номер с 1).
 *  - тосты выводятся в <ul>, каждый — <li role="status"> с текстом и кнопкой aria-label `Закрыть ${текст}`;
 *  - тост сам исчезает через ttl мс;
 *  - крестик убирает тост сразу;
 *  - при размонтировании таймеры чистятся.
 */
export function Toasts({ ttl = 3000 }: { ttl?: number }) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-15 | Тема через контекст | ★★★
/**
 * ThemeProvider хранит тему ('light' | 'dark') и кладёт её в контекст.
 * useTheme() возвращает { theme, toggle } и БРОСАЕТ понятную ошибку,
 * если вызван вне провайдера (сообщение должно содержать «ThemeProvider»).
 * ThemeButton — кнопка с текстом «Тема: light» / «Тема: dark», клик переключает.
 * Провайдер пишет тему в document.documentElement.dataset.theme.
 */
export function ThemeProvider({ children, initial = 'light' }: { children: ReactNode; initial?: 'light' | 'dark' }) {
	return <>{children}</>
}
export function useTheme(): { theme: 'light' | 'dark'; toggle: () => void } {
	return { theme: 'light', toggle: () => {} }
}
export function ThemeButton() {
	return <button>заглушка</button>
}
// #endregion

// #region RC-16 | Поле количества | ★★☆
/**
 * Управляемый счётчик: кнопки «−» и «+» (aria-label «Уменьшить» и «Увеличить»),
 * между ними инпут с подписью «Количество».
 *  - значение зажимается в [min, max], кнопки на границах задизейблены;
 *  - в инпут можно ввести только цифры, нечисловой ввод игнорируется;
 *  - пустой инпут не ломает компонент (трактуется как min).
 */
export function QuantityInput({
	value,
	onChange,
	min = 1,
	max = 99,
}: {
	value: number
	onChange: (value: number) => void
	min?: number
	max?: number
}) {
	return <div>заглушка</div>
}
// #endregion

// #region RC-17 | Надёжность пароля | ★★☆
/**
 * Инпут «Пароль» и индикатор под ним.
 * Балл считается по признакам: длина ≥ 8, есть строчная, есть заглавная, есть цифра, есть спецсимвол.
 *  - 0-2 балла → «Слабый», 3-4 → «Средний», 5 → «Надёжный»;
 *  - индикатор: <div role="progressbar" aria-valuenow={балл} aria-valuemin="0" aria-valuemax="5">;
 *  - рядом <p> с текстовой оценкой; при пустом пароле — <p>Введите пароль</p>.
 */
export function PasswordStrength() {
	return <div>заглушка</div>
}
// #endregion

// #region RC-18 | Кнопка «скопировать» | ★★☆
/**
 * Кнопка с текстом «Копировать». После успешного копирования на 2000 мс становится «Скопировано».
 *  - использует navigator.clipboard.writeText(text);
 *  - при ошибке записи текст кнопки не меняется, но появляется <p role="alert">Не удалось скопировать</p>;
 *  - повторный клик перезапускает отсчёт;
 *  - таймер чистится при размонтировании.
 */
export function CopyButton({ text }: { text: string }) {
	return <button>заглушка</button>
}
// #endregion

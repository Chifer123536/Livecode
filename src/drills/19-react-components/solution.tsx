import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 19. Открывать только после своей попытки.
 */

// #region RC-01 | Список задач
/**
 * Разбор структуры состояния — с него начинается ответ на собесе:
 *   todos: Todo[]   — единственный источник истины
 *   draft: string   — текст в поле ввода
 *   filter: Filter  — какой срез показываем
 * Видимый список и счётчик — ПРОИЗВОДНЫЕ, считаются при рендере.
 * Хранить visibleTodos в state — та самая ошибка, из-за которой список отстаёт на шаг.
 */
type Todo = { id: string; text: string; done: boolean }
type Filter = 'all' | 'active' | 'done'

export function TodoList() {
	const [todos, setTodos] = useState<Todo[]>([])
	const [draft, setDraft] = useState('')
	const [filter, setFilter] = useState<Filter>('all')
	const nextId = useRef(1)

	const visible = todos.filter(todo => (filter === 'all' ? true : filter === 'done' ? todo.done : !todo.done))
	const left = todos.filter(todo => !todo.done).length

	const add = (event: React.FormEvent) => {
		event.preventDefault()
		const text = draft.trim()
		if (!text) return
		setTodos(prev => [...prev, { id: String(nextId.current++), text, done: false }])
		setDraft('')
	}

	const filters: Array<[Filter, string]> = [
		['all', 'Все'],
		['active', 'Активные'],
		['done', 'Выполненные'],
	]

	return (
		<div>
			<form onSubmit={add}>
				<label htmlFor="todo-draft">Новая задача</label>
				<input id="todo-draft" value={draft} onChange={e => setDraft(e.target.value)} />
				<button type="submit">Добавить</button>
			</form>

			{filters.map(([value, title]) => (
				<button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
					{title}
				</button>
			))}

			{visible.length === 0 ? (
				<p>Задач нет</p>
			) : (
				<ul>
					{visible.map(todo => (
						<li key={todo.id}>
							<label>
								<input
									type="checkbox"
									checked={todo.done}
									onChange={() =>
										setTodos(prev => prev.map(t => (t.id === todo.id ? { ...t, done: !t.done } : t)))
									}
								/>
								{todo.text}
							</label>
							<button
								aria-label={`Удалить ${todo.text}`}
								onClick={() => setTodos(prev => prev.filter(t => t.id !== todo.id))}
							>
								Удалить
							</button>
						</li>
					))}
				</ul>
			)}

			<p>Осталось: {left}</p>
			<button onClick={() => setTodos(prev => prev.filter(t => !t.done))}>Очистить выполненные</button>
		</div>
	)
}
// #endregion

// #region RC-02 | Поиск с дебаунсом
/**
 * Два состояния намеренно: query управляет инпутом (должен реагировать мгновенно),
 * applied — то, по чему реально фильтруем. Привяжешь инпут к applied — печатать будет невозможно.
 * useMemo здесь оправдан только на больших списках; на десяти строках это шум, и это стоит сказать.
 */
export function SearchWithDebounce({ items, delay = 300 }: { items: string[]; delay?: number }) {
	const [query, setQuery] = useState('')
	const [applied, setApplied] = useState('')

	useEffect(() => {
		const id = setTimeout(() => setApplied(query), delay)
		return () => clearTimeout(id)
	}, [query, delay])

	const found = useMemo(() => {
		const needle = applied.trim().toLowerCase()
		if (!needle) return items
		return items.filter(item => item.toLowerCase().includes(needle))
	}, [items, applied])

	return (
		<div>
			<label htmlFor="search">Поиск</label>
			<input id="search" value={query} onChange={e => setQuery(e.target.value)} />
			{query !== applied && <p>Печатает…</p>}
			{found.length === 0 ? (
				<p>Ничего не найдено</p>
			) : (
				<ul>
					{found.map(item => (
						<li key={item}>{item}</li>
					))}
				</ul>
			)}
			<p>Найдено: {found.length}</p>
		</div>
	)
}
// #endregion

// #region RC-03 | Загрузка с отменой
/**
 * Гонка запросов — главное, что здесь проверяют. Без отмены медленный ответ на «ан»
 * приходит после быстрого на «а» и затирает актуальный результат.
 * controller.abort() в cleanup решает и это, и лишний сетевой трафик.
 * Проверка e.name === 'AbortError' обязательна: иначе на каждое нажатие клавиши
 * пользователю мигает красная ошибка.
 */
export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>

export function UserSearch({ search }: { search: SearchFn }) {
	const [query, setQuery] = useState('')
	const [items, setItems] = useState<string[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [attempt, setAttempt] = useState(0)

	// search держим в ref: если потребитель передаст инлайновую стрелку, она будет новой
	// на каждом рендере, и эффект с ней в зависимостях уйдёт в бесконечный цикл запросов.
	const searchRef = useRef(search)
	searchRef.current = search

	useEffect(() => {
		const trimmed = query.trim()
		if (!trimmed) {
			setItems(null)
			setError(null)
			setLoading(false)
			return
		}

		const controller = new AbortController()
		let cancelled = false
		setLoading(true)
		setError(null)

		searchRef.current(trimmed, controller.signal)
			.then(result => {
				if (cancelled) return
				setItems(result)
				setLoading(false)
			})
			.catch((e: unknown) => {
				if (cancelled || (e as Error)?.name === 'AbortError') return
				setItems(null)
				setError(e instanceof Error ? e.message : String(e))
				setLoading(false)
			})

		return () => {
			cancelled = true
			controller.abort()
		}
	}, [query, attempt])

	return (
		<div>
			<label htmlFor="user-search">Пользователь</label>
			<input id="user-search" value={query} onChange={e => setQuery(e.target.value)} />

			{!query.trim() && <p>Введите запрос</p>}
			{loading && <p>Загрузка…</p>}
			{error && (
				<>
					<p role="alert">{error}</p>
					<button onClick={() => setAttempt(a => a + 1)}>Повторить</button>
				</>
			)}
			{!loading && !error && items?.length === 0 && <p>Никого не нашли</p>}
			{!loading && !error && items && items.length > 0 && (
				<ul>
					{items.map(item => (
						<li key={item}>{item}</li>
					))}
				</ul>
			)}
		</div>
	)
}
// #endregion

// #region RC-04 | Форма регистрации
/**
 * errors считаются из values при каждом рендере. Держать их в useState —
 * значит вручную синхронизировать: поменял пароль, забыл пересчитать ошибку повтора,
 * и кнопка врёт. touched — наоборот настоящее состояние, из values его не вывести.
 */
export type SignupValues = { email: string; password: string; confirm: string }

function validateSignup(values: SignupValues): Partial<Record<keyof SignupValues, string>> {
	const errors: Partial<Record<keyof SignupValues, string>> = {}
	if (!/.+@.+\..+/.test(values.email)) errors.email = 'Нужен корректный email'
	if (values.password.length < 6) errors.password = 'Минимум 6 символов'
	if (values.confirm !== values.password) errors.confirm = 'Пароли не совпадают'
	return errors
}

export function SignupForm({ onSubmit }: { onSubmit: (values: SignupValues) => void }) {
	const empty: SignupValues = { email: '', password: '', confirm: '' }
	const [values, setValues] = useState<SignupValues>(empty)
	const [touched, setTouched] = useState<Partial<Record<keyof SignupValues, boolean>>>({})

	const errors = validateSignup(values)
	const isValid = Object.keys(errors).length === 0

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
		setTouched(prev => ({ ...prev, [e.target.name]: true }))

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setTouched({ email: true, password: true, confirm: true })
		if (!isValid) return
		onSubmit(values)
		setValues(empty)
		setTouched({})
	}

	const field = (name: keyof SignupValues, label: string, type: string) => {
		const showError = Boolean(touched[name] && errors[name])
		return (
			<>
				<label htmlFor={name}>{label}</label>
				<input
					id={name}
					name={name}
					type={type}
					value={values[name]}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-invalid={showError}
				/>
				{showError && <p role="alert">{errors[name]}</p>}
			</>
		)
	}

	return (
		<form onSubmit={handleSubmit}>
			{field('email', 'Email', 'text')}
			{field('password', 'Пароль', 'password')}
			{field('confirm', 'Повтор пароля', 'password')}
			<button type="submit" disabled={!isValid}>
				Зарегистрироваться
			</button>
		</form>
	)
}
// #endregion

// #region RC-05 | Модальное окно
/**
 * createPortal рендерит узел в body, но дерево React остаётся прежним:
 * контекст работает, события всплывают по React-дереву, а не по DOM.
 * Ранний выход стоит ПОСЛЕ всех хуков — хуки нельзя вызывать условно.
 * Прежнее значение overflow сохраняем и возвращаем: жёсткое '' сломает страницу,
 * у которой overflow был задан намеренно.
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
	const titleId = useId()

	useEffect(() => {
		if (!open) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, onClose])

	useEffect(() => {
		if (!open) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [open])

	if (!open) return null

	return createPortal(
		<div
			data-testid="overlay"
			onClick={event => {
				if (event.target === event.currentTarget) onClose()
			}}
		>
			<div role="dialog" aria-modal="true" aria-labelledby={titleId}>
				<h2 id={titleId}>{title}</h2>
				<button aria-label="Закрыть" onClick={onClose}>
					×
				</button>
				{children}
			</div>
		</div>,
		document.body
	)
}
// #endregion

// #region RC-06 | Пагинация
/**
 * Список страниц — чистая функция от total и page, её удобно вынести и протестировать отдельно.
 * aria-current="page" — стандартный способ пометить текущий элемент навигации.
 * Многоточие рендерится как <span>, а не как кнопка: по нему некуда нажимать.
 */
function pageRange(total: number, page: number): Array<number | '…'> {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

	const out: Array<number | '…'> = [1]
	const start = Math.max(2, page - 1)
	const end = Math.min(total - 1, page + 1)

	if (start > 2) out.push('…')
	for (let i = start; i <= end; i++) out.push(i)
	if (end < total - 1) out.push('…')
	out.push(total)
	return out
}

export function Pagination({ total, page, onChange }: { total: number; page: number; onChange: (page: number) => void }) {
	return (
		<nav>
			<button disabled={page <= 1} onClick={() => onChange(page - 1)}>
				Назад
			</button>
			{pageRange(total, page).map((item, index) =>
				item === '…' ? (
					<span key={`gap-${index}`}>…</span>
				) : (
					<button key={item} aria-current={item === page ? 'page' : undefined} onClick={() => onChange(item)}>
						{item}
					</button>
				)
			)}
			<button disabled={page >= total} onClick={() => onChange(page + 1)}>
				Вперёд
			</button>
		</nav>
	)
}
// #endregion

// #region RC-07 | Рейтинг звёздами
/**
 * hovered — локальное состояние подсветки, value — «настоящая» оценка сверху.
 * Приём «hovered ?? value» даёт правильное поведение и при наведении, и после ухода мыши.
 * Сброс по повторному клику — частое доп-требование, его проговаривают вслух заранее.
 */
export function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	const [hovered, setHovered] = useState<number | null>(null)
	const shown = hovered ?? value

	return (
		<div onMouseLeave={() => setHovered(null)}>
			{[1, 2, 3, 4, 5].map(star => (
				<button
					key={star}
					aria-label={`Оценка ${star}`}
					data-active={star <= shown}
					onMouseEnter={() => setHovered(star)}
					onClick={() => onChange(star === value ? 0 : star)}
				>
					★
				</button>
			))}
		</div>
	)
}
// #endregion

// #region RC-08 | Автокомплит
/**
 * Состояние: текст, флаг открытия и индекс подсветки.
 * Индекс сбрасывается на 0 при каждом изменении текста, иначе подсветка «повиснет»
 * на исчезнувшем пункте. Модуль по длине списка делает навигацию циклической.
 * role="listbox" / role="option" / aria-selected — контракт доступности для комбобокса.
 */
export function Autocomplete({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const [active, setActive] = useState(0)

	const matches = query.trim()
		? options.filter(option => option.toLowerCase().includes(query.trim().toLowerCase()))
		: []
	const visible = open && matches.length > 0

	const choose = (value: string) => {
		setQuery(value)
		setOpen(false)
		onSelect(value)
	}

	const onKeyDown = (event: React.KeyboardEvent) => {
		if (!visible) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setActive(index => (index + 1) % matches.length)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setActive(index => (index - 1 + matches.length) % matches.length)
		} else if (event.key === 'Enter') {
			event.preventDefault()
			choose(matches[active])
		} else if (event.key === 'Escape') {
			setOpen(false)
		}
	}

	return (
		<div>
			<label htmlFor="autocomplete">Город</label>
			<input
				id="autocomplete"
				value={query}
				onChange={e => {
					setQuery(e.target.value)
					setOpen(true)
					setActive(0)
				}}
				onKeyDown={onKeyDown}
			/>
			{visible && (
				<ul role="listbox">
					{matches.map((option, index) => (
						<li
							key={option}
							role="option"
							aria-selected={index === active}
							onMouseDown={() => choose(option)}
						>
							{option}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
// #endregion

// #region RC-09 | Корзина
/**
 * Итог и количество позиций — производные значения, ни в коем случае не отдельный state:
 * иначе после удаления строки сумма останется прежней.
 * Нижняя граница количества ставится внутри апдейтера, чтобы применяться к актуальному значению.
 */
export type CartLine = { id: string; title: string; price: number; qty: number }

export function ShoppingCart({ initial }: { initial: CartLine[] }) {
	const [lines, setLines] = useState<CartLine[]>(initial)

	const changeQty = (id: string, delta: number) =>
		setLines(prev => prev.map(line => (line.id === id ? { ...line, qty: Math.max(1, line.qty + delta) } : line)))

	const totalSum = lines.reduce((acc, line) => acc + line.price * line.qty, 0)

	if (lines.length === 0) return <p>Корзина пуста</p>

	return (
		<div>
			<ul>
				{lines.map(line => (
					<li key={line.id}>
						<span>
							{line.title} — {line.price} ₽ × {line.qty} = {line.price * line.qty} ₽
						</span>
						<button aria-label={`Меньше ${line.title}`} onClick={() => changeQty(line.id, -1)}>
							−
						</button>
						<button aria-label={`Больше ${line.title}`} onClick={() => changeQty(line.id, 1)}>
							+
						</button>
						<button
							aria-label={`Удалить ${line.title}`}
							onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
						>
							Удалить
						</button>
					</li>
				))}
			</ul>
			<p>Итого: {totalSum} ₽</p>
			<p>Позиций: {lines.length}</p>
		</div>
	)
}
// #endregion

// #region RC-10 | Сортируемая таблица
/**
 * Состояние сортировки — пара { key, dir }, а не два отдельных useState.
 * [...rows].sort() обязателен: sort мутирует, а пропсы мутировать нельзя.
 * aria-sort на <th> — то, чем скринридер объявляет направление сортировки.
 */
export type Column = { key: string; title: string }
export type Row = Record<string, string | number>

export function SortableTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
	const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

	const sorted = useMemo(() => {
		if (!sort) return rows
		return [...rows].sort((a, b) => {
			const av = a[sort.key]
			const bv = b[sort.key]
			const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
			return sort.dir === 'desc' ? -cmp : cmp
		})
	}, [rows, sort])

	const toggle = (key: string) =>
		setSort(prev => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

	return (
		<table>
			<thead>
				<tr>
					{columns.map(column => (
						<th
							key={column.key}
							aria-sort={
								sort?.key === column.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
							}
						>
							<button onClick={() => toggle(column.key)}>{column.title}</button>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{sorted.map((row, index) => (
					<tr key={String(row[columns[0].key]) + index}>
						{columns.map(column => (
							<td key={column.key}>{row[column.key]}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}
// #endregion

// #region RC-11 | Панель фильтров
/**
 * Ловушка, на которой валятся: `if (filters.inStock)` не применит фильтр,
 * когда он выключен, — и это правильно. А вот `if (filters.minPrice)` съест ноль,
 * поэтому границы цены проверяются через пустую строку, а не через truthy.
 */
export type CatalogItem = { id: number; title: string; price: number; inStock: boolean }

export function FilterPanel({ items }: { items: CatalogItem[] }) {
	const empty = { title: '', min: '', max: '', onlyStock: false }
	const [filters, setFilters] = useState(empty)

	const found = items.filter(item => {
		const needle = filters.title.trim().toLowerCase()
		if (needle && !item.title.toLowerCase().includes(needle)) return false
		if (filters.min !== '' && item.price < Number(filters.min)) return false
		if (filters.max !== '' && item.price > Number(filters.max)) return false
		if (filters.onlyStock && !item.inStock) return false
		return true
	})

	return (
		<div>
			<label htmlFor="f-title">Название</label>
			<input id="f-title" value={filters.title} onChange={e => setFilters(f => ({ ...f, title: e.target.value }))} />

			<label htmlFor="f-min">Цена от</label>
			<input id="f-min" value={filters.min} onChange={e => setFilters(f => ({ ...f, min: e.target.value }))} />

			<label htmlFor="f-max">Цена до</label>
			<input id="f-max" value={filters.max} onChange={e => setFilters(f => ({ ...f, max: e.target.value }))} />

			<label>
				<input
					type="checkbox"
					checked={filters.onlyStock}
					onChange={e => setFilters(f => ({ ...f, onlyStock: e.target.checked }))}
				/>
				Только в наличии
			</label>

			<button onClick={() => setFilters(empty)}>Сбросить</button>

			<ul>
				{found.map(item => (
					<li key={item.id}>{item.title}</li>
				))}
			</ul>
			<p>Найдено: {found.length}</p>
		</div>
	)
}
// #endregion

// #region RC-12 | Пошаговая форма
/**
 * Данные всех шагов лежат в одном объекте и живут в родителе — поэтому возврат назад
 * ничего не теряет. Хранить состояние внутри шагов нельзя: размонтированный шаг его потеряет.
 */
export type WizardValues = { name: string; city: string }

export function MultiStepForm({ onSubmit }: { onSubmit: (values: WizardValues) => void }) {
	const [step, setStep] = useState(0)
	const [values, setValues] = useState<WizardValues>({ name: '', city: '' })

	const titles = ['Контакты', 'Адрес', 'Готово']
	const canGoNext = step === 0 ? values.name.trim() !== '' : step === 1 ? values.city.trim() !== '' : true

	return (
		<div>
			<h2>{titles[step]}</h2>
			<p>Шаг {step + 1} из 3</p>

			{step === 0 && (
				<>
					<label htmlFor="w-name">Имя</label>
					<input id="w-name" value={values.name} onChange={e => setValues(v => ({ ...v, name: e.target.value }))} />
				</>
			)}
			{step === 1 && (
				<>
					<label htmlFor="w-city">Город</label>
					<input id="w-city" value={values.city} onChange={e => setValues(v => ({ ...v, city: e.target.value }))} />
				</>
			)}
			{step === 2 && (
				<p>
					{values.name}, {values.city}
				</p>
			)}

			<button disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
				Назад
			</button>
			{step < 2 ? (
				<button disabled={!canGoNext} onClick={() => setStep(s => s + 1)}>
					Далее
				</button>
			) : (
				<button onClick={() => onSubmit(values)}>Отправить</button>
			)}
		</div>
	)
}
// #endregion

// #region RC-13 | Обратный отсчёт
/**
 * onEnd вызывается ровно один раз — за это отвечает флаг в ref.
 * Без него колбэк выстрелит на каждом рендере с нулём.
 * Интервал живёт в эффекте с зависимостью от running и сам останавливается на нуле.
 */
export function Countdown({ seconds, onEnd }: { seconds: number; onEnd?: () => void }) {
	const [left, setLeft] = useState(seconds)
	const [running, setRunning] = useState(false)
	const firedRef = useRef(false)
	const onEndRef = useRef(onEnd)
	onEndRef.current = onEnd

	useEffect(() => {
		if (!running) return
		const id = setInterval(() => setLeft(value => (value <= 1 ? 0 : value - 1)), 1000)
		return () => clearInterval(id)
	}, [running])

	useEffect(() => {
		if (left !== 0 || firedRef.current) return
		firedRef.current = true
		setRunning(false)
		onEndRef.current?.()
	}, [left])

	const pad = (value: number) => String(value).padStart(2, '0')

	return (
		<div>
			<p>
				Осталось: {pad(Math.floor(left / 60))}:{pad(left % 60)}
			</p>
			{left === 0 && <p>Время вышло</p>}
			<button onClick={() => setRunning(true)}>Старт</button>
			<button onClick={() => setRunning(false)}>Пауза</button>
			<button
				onClick={() => {
					setRunning(false)
					firedRef.current = false
					setLeft(seconds)
				}}
			>
				Сброс
			</button>
		</div>
	)
}
// #endregion

// #region RC-14 | Уведомления
/**
 * Таймеры держим в Map по id, чтобы уметь погасить конкретный и почистить все при размонтировании.
 * role="status" — вежливая область живого региона: скринридер прочитает текст,
 * не прерывая пользователя (в отличие от role="alert").
 */
export function Toasts({ ttl = 3000 }: { ttl?: number }) {
	const [toasts, setToasts] = useState<Array<{ id: number; text: string }>>([])
	const nextId = useRef(1)
	const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

	useEffect(() => {
		const map = timers.current
		return () => {
			map.forEach(clearTimeout)
			map.clear()
		}
	}, [])

	const remove = (id: number) => {
		const timer = timers.current.get(id)
		if (timer) {
			clearTimeout(timer)
			timers.current.delete(id)
		}
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}

	const show = () => {
		const id = nextId.current++
		setToasts(prev => [...prev, { id, text: `Сообщение ${id}` }])
		timers.current.set(
			id,
			setTimeout(() => remove(id), ttl)
		)
	}

	return (
		<div>
			<button onClick={show}>Показать</button>
			<ul>
				{toasts.map(toast => (
					<li key={toast.id} role="status">
						{toast.text}
						<button aria-label={`Закрыть ${toast.text}`} onClick={() => remove(toast.id)}>
							×
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
// #endregion

// #region RC-15 | Тема через контекст
/**
 * Значение по умолчанию — null, а не объект: так вызов вне провайдера
 * падает с понятной ошибкой, а не тихо работает с пустышкой.
 * Значение контекста обёрнуто в useMemo, иначе каждый рендер провайдера
 * перерисовывал бы всех потребителей.
 */
type ThemeValue = { theme: 'light' | 'dark'; toggle: () => void }
const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children, initial = 'light' }: { children: ReactNode; initial?: 'light' | 'dark' }) {
	const [theme, setTheme] = useState<'light' | 'dark'>(initial)

	useEffect(() => {
		document.documentElement.dataset.theme = theme
	}, [theme])

	const value = useMemo<ThemeValue>(
		() => ({ theme, toggle: () => setTheme(t => (t === 'light' ? 'dark' : 'light')) }),
		[theme]
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
	const value = useContext(ThemeContext)
	if (!value) throw new Error('useTheme нужно вызывать внутри ThemeProvider')
	return value
}

export function ThemeButton() {
	const { theme, toggle } = useTheme()
	return <button onClick={toggle}>Тема: {theme}</button>
}
// #endregion

// #region RC-16 | Поле количества
/**
 * Компонент полностью управляемый: своего состояния нет, только value и onChange.
 * Фильтр ввода по регулярке /^\d*$/ пропускает пустую строку — иначе поле
 * невозможно очистить, чтобы набрать новое число.
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
	const clamp = (next: number) => Math.min(max, Math.max(min, next))

	return (
		<div>
			<button aria-label="Уменьшить" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
				−
			</button>
			<label htmlFor="qty">Количество</label>
			<input
				id="qty"
				value={String(value)}
				onChange={event => {
					const raw = event.target.value
					if (!/^\d*$/.test(raw)) return
					onChange(raw === '' ? min : clamp(Number(raw)))
				}}
			/>
			<button aria-label="Увеличить" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
				+
			</button>
		</div>
	)
}
// #endregion

// #region RC-17 | Надёжность пароля
/**
 * Балл — чистая функция от строки, её удобно вынести и протестировать отдельно.
 * role="progressbar" с aria-valuenow даёт скринридеру число, а текст рядом — смысл.
 * На проде оценка по регуляркам слабая, реальный ориентир — библиотека zxcvbn; скажи это вслух.
 */
function passwordScore(password: string): number {
	const checks = [
		password.length >= 8,
		/[a-zа-яё]/.test(password),
		/[A-ZА-ЯЁ]/.test(password),
		/\d/.test(password),
		/[^\wа-яё]/i.test(password),
	]
	return checks.filter(Boolean).length
}

export function PasswordStrength() {
	const [password, setPassword] = useState('')
	const score = passwordScore(password)
	const label = score <= 2 ? 'Слабый' : score <= 4 ? 'Средний' : 'Надёжный'

	return (
		<div>
			<label htmlFor="pwd">Пароль</label>
			<input id="pwd" type="password" value={password} onChange={e => setPassword(e.target.value)} />
			{password === '' ? (
				<p>Введите пароль</p>
			) : (
				<>
					<div role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={5} />
					<p>{label}</p>
				</>
			)}
		</div>
	)
}
// #endregion

// #region RC-18 | Кнопка «скопировать»
/**
 * Старый таймер гасится перед новым — иначе повторный клик оставит два отсчёта
 * и надпись сбросится раньше времени. Тот же clearTimeout нужен и при размонтировании.
 */
export function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false)
	const [failed, setFailed] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[]
	)

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text)
			setFailed(false)
			setCopied(true)
			if (timerRef.current) clearTimeout(timerRef.current)
			timerRef.current = setTimeout(() => setCopied(false), 2000)
		} catch {
			setFailed(true)
			setCopied(false)
		}
	}

	return (
		<>
			<button onClick={copy}>{copied ? 'Скопировано' : 'Копировать'}</button>
			{failed && <p role="alert">Не удалось скопировать</p>}
		</>
	)
}
// #endregion

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 17. Открывать только после своей попытки.
 */

// #region RB-01 | Пропс в разметку
/** Деструктуризация прямо в аргументе — стандарт. Значение подставляется через {}. */
export function Hello({ name }: { name: string }) {
	return <p>Привет, {name}!</p>
}
// #endregion

// #region RB-02 | Значение по умолчанию
/**
 * Дефолт в деструктуризации срабатывает только на undefined.
 * Передашь count={null} — получишь null, а не 0. Это частый баг с данными из API.
 */
export function Badge({ count = 0 }: { count?: number }) {
	return <span>Уведомлений: {count}</span>
}
// #endregion

// #region RB-03 | children и деструктуризация
/** children — обычный пропс, просто React кладёт в него всё между тегами. */
export function UserCard({ name, role, children }: { name: string; role: string; children?: ReactNode }) {
	return (
		<article>
			<h3>{name}</h3>
			<p>{role}</p>
			{children}
		</article>
	)
}
// #endregion

// #region RB-04 | useState
/**
 * setCount(c => c + 1) — функциональная форма. Правило: новое состояние зависит от старого →
 * всегда функция. Иначе в одном обработчике два вызова схлопнутся в один шаг.
 */
export function Counter() {
	const [count, setCount] = useState(0)
	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
		</div>
	)
}
// #endregion

// #region RB-05 | Условный рендер
/**
 * {visible && <p/>} не рендерит узел вовсе — это не то же самое, что display:none.
 * Скрытый через CSS элемент остаётся в DOM, в дереве доступности и в табуляции.
 */
export function Toggle() {
	const [visible, setVisible] = useState(false)
	return (
		<div>
			<button onClick={() => setVisible(v => !v)}>{visible ? 'Скрыть' : 'Показать'}</button>
			{visible && <p>Секрет</p>}
		</div>
	)
}
// #endregion

// #region RB-06 | Контролируемый инпут
/**
 * value + onChange = контролируемый компонент. Забыл onChange — инпут «мёртвый»,
 * React вернёт прежнее значение на каждое нажатие.
 * htmlFor + id связывают подпись с полем: без этого клик по подписи не фокусирует инпут.
 */
export function EchoInput() {
	const [text, setText] = useState('')
	return (
		<div>
			<label htmlFor="echo">Имя</label>
			<input id="echo" value={text} onChange={e => setText(e.target.value)} />
			<p>{text || 'ничего не введено'}</p>
		</div>
	)
}
// #endregion

// #region RB-07 | Список и key
/** key нужен React для сопоставления элементов между рендерами и в пропсы не попадает. */
export function FruitList({ items }: { items: string[] }) {
	return (
		<ul>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}
// #endregion

// #region RB-08 | Пустое состояние
/** Ранний выход читается лучше вложенного тернарника и сразу виден на ревью. */
export function ListWithEmpty({ items }: { items: string[] }) {
	if (items.length === 0) return <p>Список пуст</p>
	return (
		<ul>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}
// #endregion

// #region RB-09 | Производное значение
/**
 * visible считается при рендере. Второй useState под отфильтрованный список — источник
 * рассинхрона: меняется products, а список остаётся старым.
 * Правило: если значение выводится из другого состояния — это не состояние.
 */
export type Product = { id: number; title: string; inStock: boolean }
export function StockFilter({ products }: { products: Product[] }) {
	const [onlyStock, setOnlyStock] = useState(false)
	const visible = onlyStock ? products.filter(p => p.inStock) : products

	return (
		<div>
			<label>
				<input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} />
				только в наличии
			</label>
			<ul>
				{visible.map(product => (
					<li key={product.id}>{product.title}</li>
				))}
			</ul>
			<p>Показано: {visible.length}</p>
		</div>
	)
}
// #endregion

// #region RB-10 | Подъём состояния
/**
 * Данные вниз через value, события вверх через onChange. Компонент без своего состояния
 * называется контролируемым — этот термин нужно произнести вслух на собесе.
 * Number('') === 0, а Number('abc') === NaN, поэтому нужен || 0.
 */
export function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	return (
		<label>
			{label}
			<input value={value} onChange={e => onChange(e.target.value)} />
		</label>
	)
}
export function SumBox() {
	const [first, setFirst] = useState('')
	const [second, setSecond] = useState('')
	const sum = (Number(first) || 0) + (Number(second) || 0)

	return (
		<div>
			<NumberInput label="Первое" value={first} onChange={setFirst} />
			<NumberInput label="Второе" value={second} onChange={setSecond} />
			<p>Сумма: {sum}</p>
		</div>
	)
}
// #endregion

// #region RB-11 | Функциональный setState
/**
 * count в замыкании обработчика — константа этого рендера. Три вызова setCount(count + 1)
 * прочитают одно и то же число и дадут +1. Апдейтеры же применяются по очереди к актуальному
 * значению, поэтому дают +3. React батчит обновления, в 18+ — в том числе в промисах и таймерах.
 */
export function BatchCounter() {
	const [count, setCount] = useState(0)
	const bump = () => {
		setCount(c => c + 1)
		setCount(c => c + 1)
		setCount(c => c + 1)
	}
	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
			<button onClick={bump}>+3</button>
		</div>
	)
}
// #endregion

// #region RB-12 | Объект в состоянии
/**
 * Вычисляемый ключ [e.target.name] — то, что здесь проверяют.
 * Спред обязателен: setValues({ name }) затрёт city. React не мержит состояние,
 * в отличие от this.setState из классов — это частый вопрос на собесе.
 */
export function ProfileForm() {
	const [values, setValues] = useState({ name: '', city: '' })
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))

	return (
		<div>
			<label>
				Имя
				<input name="name" value={values.name} onChange={handleChange} />
			</label>
			<label>
				Город
				<input name="city" value={values.city} onChange={handleChange} />
			</label>
			<p>
				{values.name || '—'} из {values.city || '—'}
			</p>
		</div>
	)
}
// #endregion

// #region RB-13 | Массив в состоянии
/**
 * Добавление — [...prev, item], удаление — filter. push не вызовет ререндер:
 * ссылка на массив та же, а React сравнивает состояние через Object.is.
 */
export function TagList() {
	const [tags, setTags] = useState<string[]>([])
	const [draft, setDraft] = useState('')

	const add = () => {
		const value = draft.trim()
		if (!value) return
		setTags(prev => [...prev, value])
		setDraft('')
	}

	return (
		<div>
			<label htmlFor="tag">Тег</label>
			<input id="tag" value={draft} onChange={e => setDraft(e.target.value)} />
			<button onClick={add}>Добавить</button>
			<ul>
				{tags.map(tag => (
					<li key={tag}>
						{tag}
						<button aria-label={`Удалить ${tag}`} onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
							Удалить
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}
// #endregion

// #region RB-14 | Форма и preventDefault
/**
 * onSubmit на форме, а не onClick на кнопке: иначе Enter в инпуте перезагрузит страницу.
 * preventDefault обязателен — нативный сабмит уводит браузер на новый URL.
 */
export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
	const [query, setQuery] = useState('')
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const value = query.trim()
		if (!value) return
		onSearch(value)
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="q">Запрос</label>
			<input id="q" value={query} onChange={e => setQuery(e.target.value)} />
			<button type="submit">Найти</button>
		</form>
	)
}
// #endregion

// #region RB-15 | Контролируемый select
/** У select в React значение задаётся через value на самом select, а не selected на option. */
export const COLORS = ['красный', 'зелёный', 'синий']
export function ColorSelect() {
	const [color, setColor] = useState(COLORS[0])
	return (
		<div>
			<label htmlFor="color">Цвет</label>
			<select id="color" value={color} onChange={e => setColor(e.target.value)}>
				{COLORS.map(item => (
					<option key={item} value={item}>
						{item}
					</option>
				))}
			</select>
			<p>Выбрано: {color}</p>
		</div>
	)
}
// #endregion

// #region RB-16 | Группа чекбоксов
/**
 * Хранится массив выбранных, порядок вывода берётся из options — тогда он не зависит
 * от порядка кликов. Переключение — тот же toggleItem из пака ARR.
 */
export function CheckboxGroup({ options }: { options: string[] }) {
	const [selected, setSelected] = useState<string[]>([])
	const toggle = (option: string) =>
		setSelected(prev => (prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]))
	const ordered = options.filter(option => selected.includes(option))

	return (
		<div>
			{options.map(option => (
				<label key={option}>
					<input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
					{option}
				</label>
			))}
			<p>{ordered.length ? `Выбрано: ${ordered.join(', ')}` : 'Ничего не выбрано'}</p>
		</div>
	)
}
// #endregion

// #region RB-17 | Вкладки
/**
 * role="tablist" / role="tab" / aria-selected — это не украшение, а контракт для скринридеров.
 * Активная вкладка хранится одним id, а не флагом в каждом объекте.
 */
export type Tab = { id: string; title: string; content: string }
export function Tabs({ tabs }: { tabs: Tab[] }) {
	const [activeId, setActiveId] = useState(tabs[0]?.id)
	const active = tabs.find(tab => tab.id === activeId) ?? tabs[0]

	return (
		<div>
			<div role="tablist">
				{tabs.map(tab => (
					<button key={tab.id} role="tab" aria-selected={tab.id === activeId} onClick={() => setActiveId(tab.id)}>
						{tab.title}
					</button>
				))}
			</div>
			<p>{active?.content}</p>
		</div>
	)
}
// #endregion

// #region RB-18 | Аккордеон
/** Один openId вместо массива флагов: «открыта только одна» становится невозможно нарушить. */
export type Section = { id: string; title: string; body: string }
export function Accordion({ sections }: { sections: Section[] }) {
	const [openId, setOpenId] = useState<string | null>(null)

	return (
		<div>
			{sections.map(section => {
				const open = section.id === openId
				return (
					<div key={section.id}>
						<button aria-expanded={open} onClick={() => setOpenId(open ? null : section.id)}>
							{section.title}
						</button>
						{open && <p>{section.body}</p>}
					</div>
				)
			})}
		</div>
	)
}
// #endregion

// #region RB-19 | Ловушка нуля
/**
 * {count && <p/>} при count === 0 вернёт 0, а React рендерит числа как текст — на экране «0».
 * false, null и undefined React не рендерит, а 0 и NaN — рендерит. Отсюда правило:
 * слева от && всегда должно быть булево. Либо count > 0 &&, либо тернарник.
 */
export function ZeroTrap({ count }: { count: number }) {
	return <div>{count > 0 ? <p>Товаров: {count}</p> : null}</div>
}
// #endregion

// #region RB-20 | Статус в человеческий вид
/**
 * Словарь вместо цепочки if: добавить статус — одна строка, и нет забытой ветки.
 * Record<string, string> + ?? даёт безопасный дефолт для неизвестных значений с бэка.
 */
const STATUS_TEXT: Record<string, string> = {
	new: 'Новый',
	paid: 'Оплачен',
	cancelled: 'Отменён',
}
export function StatusBadge({ status }: { status: string }) {
	return <span data-status={status}>{STATUS_TEXT[status] ?? 'Неизвестно'}</span>
}
// #endregion

// #region RB-21 | useEffect и cleanup
/**
 * Массив зависимостей: [] — один раз при монтировании, [count] — на каждое изменение count,
 * без массива — после каждого рендера. Возвращённая функция вызывается перед следующим
 * эффектом и при размонтировании.
 */
export function TitleCounter() {
	const [count, setCount] = useState(0)

	useEffect(() => {
		document.title = String(count)
		return () => {
			document.title = 'Livecode'
		}
	}, [count])

	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
		</div>
	)
}
// #endregion

// #region RB-22 | useRef на DOM
/**
 * Запись в ref.current не вызывает ререндер — в этом и смысл.
 * Опциональная цепочка нужна: до монтирования ref.current === null.
 */
export function FocusInput() {
	const inputRef = useRef<HTMLInputElement>(null)
	return (
		<div>
			<label htmlFor="focus-me">Поиск</label>
			<input id="focus-me" ref={inputRef} />
			<button onClick={() => inputRef.current?.focus()}>Фокус</button>
		</div>
	)
}
// #endregion

// #region RB-23 | Интервал и очистка
/**
 * Без clearInterval в cleanup при повторном монтировании побегут два интервала,
 * и счётчик пойдёт через два. В StrictMode дев-режима React монтирует компонент дважды
 * специально, чтобы эта ошибка вылезла сразу.
 * id интервала — в ref: его изменение не должно перерисовывать компонент.
 */
export function Stopwatch() {
	const [seconds, setSeconds] = useState(0)
	const [running, setRunning] = useState(false)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(() => {
		if (!running) return
		timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
		return () => {
			if (timerRef.current) clearInterval(timerRef.current)
		}
	}, [running])

	return (
		<div>
			<p>Прошло: {seconds} с</p>
			<button onClick={() => setRunning(true)}>Старт</button>
			<button onClick={() => setRunning(false)}>Пауза</button>
			<button
				onClick={() => {
					setRunning(false)
					setSeconds(0)
				}}
			>
				Сброс
			</button>
		</div>
	)
}
// #endregion

// #region RB-24 | Предыдущее значение
/**
 * Эффект выполняется ПОСЛЕ рендера, поэтому во время рендера ref ещё хранит старое значение.
 * Именно этот сдвиг на один рендер и даёт «предыдущее».
 */
export function PrevValue() {
	const [count, setCount] = useState(0)
	const prevRef = useRef<number | null>(null)
	const prev = prevRef.current

	useEffect(() => {
		prevRef.current = count
	}, [count])

	return (
		<div>
			<p>
				Сейчас: {count}, было: {prev === null ? '—' : prev}
			</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
		</div>
	)
}
// #endregion

// #region RB-25 | Клик снаружи
/**
 * Слушаем mousedown, а не click: меню закроется до того, как отработает клик по элементу
 * под ним, и поведение будет предсказуемым.
 * contains вернёт true и для самой кнопки, поэтому открывающий клик меню не закрывает.
 * Эффект зависит от open — когда меню закрыто, слушателя на документе нет вообще.
 */
export function DropdownMenu({ items }: { items: string[] }) {
	const [open, setOpen] = useState(false)
	const boxRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onMouseDown = (event: MouseEvent) => {
			if (!boxRef.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onMouseDown)
		return () => document.removeEventListener('mousedown', onMouseDown)
	}, [open])

	return (
		<div ref={boxRef}>
			<button onClick={() => setOpen(o => !o)}>Меню</button>
			{open && (
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

// #region RB-26 | key по id, а не по индексу
/**
 * React сопоставляет элементы между рендерами по key. С key={index} после удаления первого
 * элемента ключ 0 достанется бывшему второму, и React переиспользует ДОМ-узел первого —
 * вместе с его внутренним состоянием: положением каретки, скроллом, галочкой чекбокса.
 * Именно поэтому key={index} безопасен только для статичных списков без состояния.
 */
export type Item = { id: string; title: string }
export function KeyedList({ initial }: { initial: Item[] }) {
	const [items, setItems] = useState(initial)

	return (
		<div>
			<button onClick={() => setItems(prev => prev.slice(1))}>Удалить первую</button>
			<ul>
				{items.map(item => (
					<li key={item.id}>
						<label>
							<input type="checkbox" />
							{item.title}
						</label>
					</li>
				))}
			</ul>
		</div>
	)
}
// #endregion

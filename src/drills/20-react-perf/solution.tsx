import {
	memo,
	useCallback,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
	useTransition,
	type ReactNode,
} from 'react'

/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 20. Открывать только после своей попытки.
 *
 * Сквозная мысль пака: memo сравнивает пропсы через Object.is.
 * Всё, что создаётся заново при каждом рендере — стрелка, объект, массив, JSX-элемент —
 * делает мемоизацию бессмысленной. Поэтому memo почти всегда идёт в паре
 * с useCallback или useMemo на стороне родителя.
 */

export type Counted = { onRender: () => void }

// #region RP-01 | Мемоизация дочернего компонента
/**
 * memo сравнивает пропсы и пропускает рендер, если они не изменились.
 * title здесь строковый литерал, onRender приходит сверху неизменным — оба стабильны,
 * поэтому клик по кнопке перерисовывает только родителя.
 */
export const Child = memo(function Child({ title, onRender }: { title: string } & Counted) {
	onRender()
	return <p>{title}</p>
})

export function Parent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	parentRender()
	const [count, setCount] = useState(0)

	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
			<Child title="постоянный" onRender={childRender} />
		</div>
	)
}
// #endregion

// #region RP-02 | Стабильный обработчик
/**
 * Без useCallback стрелка пересоздаётся на каждом рендере родителя,
 * Object.is даёт false, и memo становится бесполезным.
 * Пустой массив зависимостей возможен только потому, что используется
 * функциональная форма сеттера: текущий count в замыкании не нужен.
 */
export const ActionChild = memo(function ActionChild({ onAction, onRender }: { onAction: () => void } & Counted) {
	onRender()
	return <button onClick={onAction}>Действие</button>
})

export function ActionParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	parentRender()
	const [count, setCount] = useState(0)
	const handleAction = useCallback(() => setCount(c => c + 1), [])

	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
			<ActionChild onAction={handleAction} onRender={childRender} />
		</div>
	)
}
// #endregion

// #region RP-03 | Стабильный объект в пропсах
/**
 * Литерал { theme: 'dark' } в JSX — новый объект при каждом рендере.
 * useMemo с пустыми зависимостями фиксирует ссылку.
 * Альтернатива без хуков: вынести константу за пределы компонента —
 * так даже дешевле, потому что useMemo сам по себе не бесплатен.
 */
export const ConfigChild = memo(function ConfigChild({
	config,
	onRender,
}: { config: { theme: string } } & Counted) {
	onRender()
	return <p>Тема: {config.theme}</p>
})

export function ConfigParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	parentRender()
	const [count, setCount] = useState(0)
	const config = useMemo(() => ({ theme: 'dark' }), [])

	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
			<ConfigChild config={config} onRender={childRender} />
		</div>
	)
}
// #endregion

// #region RP-04 | Дорогое вычисление
/**
 * useMemo запоминает РЕЗУЛЬТАТ между рендерами, пока зависимости не изменились.
 * Ввод текста меняет только text, numbers остаются той же ссылкой — пересчёта нет.
 * Важно: если бы numbers приходили новым массивом каждый раз,
 * useMemo не помог бы и пришлось бы мемоизировать их у родителя.
 */
export function ExpensiveSum({ numbers, calculate }: { numbers: number[]; calculate: () => void }) {
	const [text, setText] = useState('')

	const sum = useMemo(() => {
		calculate()
		return numbers.reduce((acc, n) => acc + n, 0)
	}, [numbers, calculate])

	return (
		<div>
			<label htmlFor="text">Текст</label>
			<input id="text" value={text} onChange={e => setText(e.target.value)} />
			<p>Сумма: {sum}</p>
		</div>
	)
}
// #endregion

// #region RP-05 | Свой компаратор в memo
/**
 * Второй аргумент memo — функция сравнения. Она возвращает true, когда пропсы
 * «одинаковые» и рендер можно пропустить. Логика ОБРАТНА shouldComponentUpdate,
 * на этом часто путаются.
 * Сравнивать надо все пропсы, которые реально используются, иначе получишь
 * залипший интерфейс, который не реагирует на изменения.
 */
export type User = { id: number; name: string }

export const UserCard = memo(
	function UserCard({ user, onRender }: { user: User } & Counted) {
		onRender()
		return <p>Пользователь: {user.name}</p>
	},
	(prev, next) => prev.user.id === next.user.id && prev.onRender === next.onRender
)
// #endregion

// #region RP-06 | Ленивая инициализация состояния
/**
 * useState(init()) вызывает init на КАЖДОМ рендере, а результат со второго раза выбрасывается.
 * useState(init) передаёт саму функцию — React вызовет её только при монтировании.
 * Разница незаметна на числах и критична на разборе localStorage или большом массиве.
 */
export function LazyInit({ init }: { init: () => number }) {
	const [value, setValue] = useState(init)

	return (
		<div>
			<p>Значение: {value}</p>
			<button onClick={() => setValue(v => v + 1)}>+1</button>
		</div>
	)
}
// #endregion

// #region RP-07 | Ref вместо состояния
/**
 * Запись в ref.current не вызывает перерисовку — именно поэтому ref подходит
 * для данных, которых нет на экране: счётчиков, таймеров, предыдущих значений.
 * Как только значение нужно показать, оно переносится в state.
 */
export function ClickTracker({ onRender }: Counted) {
	onRender()
	const clicks = useRef(0)
	const [shown, setShown] = useState<number | null>(null)

	return (
		<div>
			<button
				onClick={() => {
					clicks.current += 1
				}}
			>
				Клик
			</button>
			<button onClick={() => setShown(clicks.current)}>Показать</button>
			{shown !== null && <p>Кликов: {shown}</p>}
		</div>
	)
}
// #endregion

// #region RP-08 | children как пропс
/**
 * Элемент <Expensive /> создаётся в РОДИТЕЛЕ обёртки и передаётся вниз готовым объектом.
 * При перерисовке Wrapper эта ссылка не меняется, и React пропускает всё поддерево
 * без всякого memo. Приём работает для любого пропса-элемента, не только children.
 */
export function Expensive({ onRender }: Counted) {
	onRender()
	return <p>Дорогой контент</p>
}

export function Wrapper({ children, onRender }: { children: ReactNode } & Counted) {
	onRender()
	const [count, setCount] = useState(0)

	return (
		<div>
			<p>Счёт: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>+1</button>
			{children}
		</div>
	)
}
// #endregion

// #region RP-09 | Вынести состояние вниз
/**
 * Состояние инпута живёт в маленьком компоненте, поэтому его изменение
 * перерисовывает только его. Родитель состояния не имеет и не перерисовывается вовсе.
 * Это дешевле любой мемоизации: лучший способ не перерисовывать дерево —
 * не менять состояние наверху.
 */
function NoteInput() {
	const [note, setNote] = useState('')
	return (
		<>
			<label htmlFor="note">Заметка</label>
			<input id="note" value={note} onChange={e => setNote(e.target.value)} />
		</>
	)
}

export const HeavyList = memo(function HeavyList({ items, onRender }: { items: string[] } & Counted) {
	onRender()
	return (
		<ul>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
})

export function NotePanel({ items, listRender }: { items: string[]; listRender: () => void }) {
	return (
		<div>
			<NoteInput />
			<HeavyList items={items} onRender={listRender} />
		</div>
	)
}
// #endregion

// #region RP-10 | Мемоизированный элемент списка
/**
 * Три условия, чтобы соседние строки не перерисовывались:
 *  - memo на строке;
 *  - стабильный onRemove через useCallback с функциональным сеттером;
 *  - id передаётся ВНУТРЬ строки, а не захватывается стрелкой в родителе.
 * Нарушишь любое — и memo перестанет работать, хотя выглядеть код будет правильно.
 */
export type Item = { id: string; title: string }

export const Row = memo(function Row({
	item,
	onRemove,
	onRender,
}: {
	item: Item
	onRemove: (id: string) => void
	onRender: (id: string) => void
}) {
	onRender(item.id)
	return (
		<li>
			{item.title}
			<button aria-label={`Удалить ${item.title}`} onClick={() => onRemove(item.id)}>
				×
			</button>
		</li>
	)
})

export function RowList({ initial, rowRender }: { initial: Item[]; rowRender: (id: string) => void }) {
	const [items, setItems] = useState(initial)
	const handleRemove = useCallback((id: string) => setItems(prev => prev.filter(item => item.id !== id)), [])

	return (
		<ul>
			{items.map(item => (
				<Row key={item.id} item={item} onRemove={handleRemove} onRender={rowRender} />
			))}
		</ul>
	)
}
// #endregion

// #region RP-11 | Подписка на внешний стор
/**
 * useSyncExternalStore принимает подписку и функцию-снимок. React сам подпишется,
 * отпишется и гарантирует согласованность при конкурентном рендеринге.
 * Ручная связка useEffect + setState этого не гарантирует: между чтением и подпиской
 * есть окно, в котором можно пропустить обновление (tearing).
 * Третий аргумент — снимок для сервера, нужен при SSR.
 */
export type ExternalStore = {
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => number
}

export function StoreValue({ store, onRender }: { store: ExternalStore } & Counted) {
	onRender()
	const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
	return <p>Значение: {value}</p>
}
// #endregion

// #region RP-12 | Переход без блокировки
/**
 * startTransition помечает обновление как НЕсрочное: React может прервать его,
 * чтобы сначала отрисовать срочное — например, ввод в поле.
 * isPending даёт честный индикатор, пока тяжёлый рендер идёт.
 * Срочные обновления (значение инпута) внутрь startTransition класть нельзя.
 */
export function TransitionTabs() {
	const [tab, setTab] = useState<'fast' | 'heavy'>('fast')
	const [isPending, startTransition] = useTransition()

	const select = (next: 'fast' | 'heavy') => startTransition(() => setTab(next))

	return (
		<div>
			<div role="tablist">
				<button role="tab" aria-selected={tab === 'fast'} onClick={() => select('fast')}>
					Быстрая
				</button>
				<button role="tab" aria-selected={tab === 'heavy'} onClick={() => select('heavy')}>
					Тяжёлая
				</button>
			</div>
			{isPending && <span>Переключаю…</span>}
			<p>{tab === 'fast' ? 'Быстрое содержимое' : 'Тяжёлое содержимое'}</p>
		</div>
	)
}
// #endregion

// #region RP-13 | Окно списка
/**
 * Суть виртуализации: в DOM живёт только видимая часть, остальное — арифметика.
 * Десять тысяч <li> кладут страницу не рендером React, а самим DOM и раскладкой.
 * В проде берут react-window или TanStack Virtual, но идею надо уметь объяснить.
 */
export function WindowedList({ items, visible }: { items: string[]; visible: number }) {
	const [start, setStart] = useState(0)
	const maxStart = Math.max(0, items.length - visible)
	const slice = items.slice(start, start + visible)

	return (
		<div>
			<button onClick={() => setStart(s => Math.max(0, s - visible))}>Вверх</button>
			<button onClick={() => setStart(s => Math.min(maxStart, s + visible))}>Вниз</button>
			<ul>
				{slice.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p>
				Показано {slice.length} из {items.length}
			</p>
		</div>
	)
}
// #endregion

// #region RP-14 | Батчинг обновлений
/**
 * React 18 объединяет все обновления внутри одного «тика» в один рендер —
 * включая промисы, таймеры и нативные обработчики. В React 17 батчинг работал
 * только внутри React-событий, поэтому setState в then давал два рендера.
 * Именно это называется automatic batching.
 */
export function DoubleUpdate({ onRender }: Counted) {
	onRender()
	const [a, setA] = useState(0)
	const [b, setB] = useState(0)

	const bumpBoth = () => {
		setA(x => x + 1)
		setB(x => x + 1)
	}

	return (
		<div>
			<p>
				A: {a}, B: {b}
			</p>
			<button onClick={bumpBoth}>Обновить оба</button>
			<button onClick={() => void Promise.resolve().then(bumpBoth)}>Обновить в промисе</button>
		</div>
	)
}
// #endregion

// #region RP-15 | Производное состояние без эффекта
/**
 * Фильтрация — чистая функция от items и query, значит это НЕ состояние.
 * Вариант с useEffect + setFiltered даёт лишний рендер и окно рассинхрона,
 * в котором пользователь видит старый список. Плюс бесконечный цикл,
 * если забыть зависимости.
 * Правило: можешь вывести значение из существующего состояния — выводи при рендере.
 */
export function FilteredList({ items, onRender }: { items: string[] } & Counted) {
	onRender()
	const [query, setQuery] = useState('')
	const found = items.filter(item => item.toLowerCase().includes(query.toLowerCase()))

	return (
		<div>
			<label htmlFor="filter">Фильтр</label>
			<input id="filter" value={query} onChange={e => setQuery(e.target.value)} />
			<ul>
				{found.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p>Найдено: {found.length}</p>
		</div>
	)
}
// #endregion

// #region RP-16 | Сброс состояния через key
/**
 * Смена key заставляет React размонтировать старый компонент и смонтировать новый —
 * со свежим состоянием. Это штатный приём вместо useEffect, который «синхронизирует»
 * состояние с пропсом: тот даёт лишний рендер и легко превращается в цикл.
 */
export function NameForm({ initialName }: { initialName: string }) {
	const [name, setName] = useState(initialName)

	return (
		<>
			<label htmlFor="name">Имя</label>
			<input id="name" value={name} onChange={e => setName(e.target.value)} />
		</>
	)
}

export function UserEditor({ users }: { users: User[] }) {
	const [index, setIndex] = useState(0)
	const user = users[index]

	return (
		<div>
			<button onClick={() => setIndex(i => (i + 1) % users.length)}>Следующий</button>
			<NameForm key={user.id} initialName={user.name} />
		</div>
	)
}
// #endregion

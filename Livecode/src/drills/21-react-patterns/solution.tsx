/**
 * ЭТАЛОННЫЕ РЕШЕНИЯ ПАКА 21. Открывать только после своей попытки.
 */
import { Component, createContext, useCallback, useContext, useEffect, useId, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, FormEvent, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'

// #region RX-01 | Контекст и хук доступа
/**
 * Контекст создаётся со значением null, а хук проверяет его и бросает понятную ошибку.
 * Это лучше значения по умолчанию: молчаливый дефолт превращает забытый провайдер
 * в загадочный баг вместо явного падения.
 * useMemo на значении обязателен — иначе новый объект на каждом рендере
 * перерисовывает всех потребителей контекста.
 */
export type Theme = 'light' | 'dark'

type ThemeValue = { theme: Theme; toggle: () => void }
const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ initial = 'light', children }: { initial?: Theme; children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(initial)

	const value = useMemo<ThemeValue>(
		() => ({ theme, toggle: () => setTheme(current => (current === 'light' ? 'dark' : 'light')) }),
		[theme]
	)

	return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeValue {
	const value = useContext(ThemeContext)
	if (!value) throw new Error('useTheme можно вызывать только внутри ThemeProvider')
	return value
}
// #endregion

// #region RX-02 | Составной компонент
/**
 * Состояние живёт в корне, дети берут его из контекста — поэтому разметку между
 * List и Panel можно тасовать как угодно, не меняя компонент.
 * Неактивная панель не рендерится вовсе: так внутри неё не выполняются эффекты и запросы.
 */
type TabsValue = { active: string; select: (value: string) => void }
const TabsContext = createContext<TabsValue | null>(null)

const useTabs = (): TabsValue => {
	const value = useContext(TabsContext)
	if (!value) throw new Error('Части Tabs работают только внутри Tabs')
	return value
}

export const Tabs = Object.assign(
	function TabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
		const [active, setActive] = useState(defaultValue)
		const value = useMemo<TabsValue>(() => ({ active, select: setActive }), [active])

		return <TabsContext value={value}>{children}</TabsContext>
	},
	{
		List: function TabsList({ children }: { children: ReactNode }) {
			return <div role="tablist">{children}</div>
		},

		Tab: function Tab({ value, children }: { value: string; children: ReactNode }) {
			const { active, select } = useTabs()
			return (
				<button role="tab" aria-selected={active === value} onClick={() => select(value)}>
					{children}
				</button>
			)
		},

		Panel: function TabPanel({ value, children }: { value: string; children: ReactNode }) {
			const { active } = useTabs()
			if (active !== value) return null
			return <div role="tabpanel">{children}</div>
		},
	}
)
// #endregion

// #region RX-03 | Render-props
/**
 * Компонент владеет состоянием, разметку решает вызывающий.
 * Хуки делают то же самое проще, но приём остался в библиотеках компонентов,
 * где нужно отдать состояние в произвольную разметку.
 */
export function Toggle({
	initial = false,
	children,
}: {
	initial?: boolean
	children: (state: { on: boolean; toggle: () => void }) => ReactNode
}) {
	const [on, setOn] = useState(initial)
	const toggle = useCallback(() => setOn(current => !current), [])

	return <>{children({ on, toggle })}</>
}
// #endregion

// #region RX-04 | Компонент высшего порядка
/**
 * loading вынимается из пропсов и НЕ уходит в исходный компонент —
 * иначе React предупредит про неизвестный атрибут на DOM-узле.
 * displayName нужен для девтулзов: без него в дереве будет безымянный Wrapped.
 */
export function withLoading<P extends object>(Component: ComponentType<P>): ComponentType<P & { loading: boolean }> {
	const Wrapped = ({ loading, ...rest }: P & { loading: boolean }) =>
		loading ? <p>Загрузка…</p> : <Component {...(rest as P)} />

	Wrapped.displayName = `withLoading(${Component.displayName ?? Component.name ?? 'Component'})`
	return Wrapped
}
// #endregion

// #region RX-05 | Управляемый и неуправляемый
/**
 * Режим определяется один раз: value !== undefined — значит состояние снаружи.
 * Внутреннее состояние существует всегда, но в управляемом режиме не используется —
 * так компонент не «теряет» ввод при переключении, а React не ругается на смену режима.
 */
export function NameInput({
	value,
	defaultValue = '',
	onChange,
}: {
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
}) {
	const [inner, setInner] = useState(defaultValue)
	const controlled = value !== undefined
	const current = controlled ? value : inner

	return (
		<label>
			Имя
			<input
				value={current}
				onChange={event => {
					if (!controlled) setInner(event.target.value)
					onChange?.(event.target.value)
				}}
			/>
		</label>
	)
}
// #endregion

// #region RX-06 | Форма на useReducer
/**
 * Редьюсер чистый: каждое действие собирает НОВЫЕ объекты values и touched.
 * Мутация state.values[name] = value «сработала» бы, но React не увидел бы изменения
 * и не перерисовал компонент — это классическая ошибка.
 */
export type FormState = {
	values: Record<string, string>
	touched: Record<string, boolean>
	submitted: boolean
}
export type FormAction =
	| { type: 'change'; name: string; value: string }
	| { type: 'blur'; name: string }
	| { type: 'submit' }
	| { type: 'reset' }

export const initialFormState = (values: Record<string, string>): FormState => ({
	values,
	touched: {},
	submitted: false,
})

export function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case 'change':
			return { ...state, values: { ...state.values, [action.name]: action.value } }

		case 'blur':
			return { ...state, touched: { ...state.touched, [action.name]: true } }

		case 'submit': {
			const touched = Object.fromEntries(Object.keys(state.values).map(key => [key, true]))
			return { ...state, touched, submitted: true }
		}

		case 'reset':
			return initialFormState(state.values)

		default:
			return state
	}
}

export const useForm = (values: Record<string, string>) => useReducer(formReducer, initialFormState(values))
// #endregion

// #region RX-07 | Слоты
/**
 * Условный рендер вместо пустых узлов: <header> без содержимого — лишняя разметка
 * и лишний отступ в вёрстке.
 */
export function Card({ title, footer, children }: { title?: ReactNode; footer?: ReactNode; children: ReactNode }) {
	return (
		<div className="card">
			{title ? <header>{title}</header> : null}
			<div className="card-body">{children}</div>
			{footer ? <footer>{footer}</footer> : null}
		</div>
	)
}
// #endregion

// #region RX-08 | Полиморфный компонент
/**
 * Тег приходит пропсом as, а тип пропсов выводится из него через ComponentPropsWithoutRef.
 * Заглавная буква в имени переменной обязательна: JSX считает строчные имена
 * названиями html-тегов.
 */
export type BoxProps<E extends ElementType> = { as?: E } & Omit<ComponentPropsWithoutRef<E>, 'as'>

export function Box<E extends ElementType = 'div'>({ as, ...rest }: BoxProps<E>) {
	const Component = (as ?? 'div') as ElementType
	return <Component {...rest} />
}
// #endregion

// #region RX-09 | Граница ошибок
/**
 * getDerivedStateFromError переводит компонент в состояние ошибки при рендере детей,
 * componentDidCatch годится для отправки в логи.
 * Границы НЕ ловят ошибки обработчиков событий, асинхронного кода и самого себя —
 * это первое, что спрашивают после «напиши ErrorBoundary».
 */
export class ErrorBoundary extends Component<
	{ children: ReactNode; onError?: (error: Error) => void },
	{ error: Error | null }
> {
	state = { error: null as Error | null }

	static getDerivedStateFromError(error: Error) {
		return { error }
	}

	componentDidCatch(error: Error) {
		this.props.onError?.(error)
	}

	render() {
		if (this.state.error) {
			return (
				<div>
					<p>Что-то сломалось</p>
					<button onClick={() => this.setState({ error: null })}>Повторить</button>
				</div>
			)
		}
		return this.props.children
	}
}
// #endregion

// #region RX-10 | Портал
/**
 * createPortal рендерит узел в другое место дерева DOM, сохраняя место в дереве React:
 * контекст и всплытие событий продолжают работать как будто модалка на месте вызова.
 * Escape вешается на document и снимается в очистке эффекта — иначе после закрытия
 * обработчик останется висеть.
 * Клик по содержимому не должен закрывать окно, поэтому проверяем, что цель — сам фон.
 */
export function Modal({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean
	title: string
	onClose: () => void
	children: ReactNode
}) {
	useEffect(() => {
		if (!open) return

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, onClose])

	if (!open) return null

	return createPortal(
		<div
			data-testid="overlay"
			onClick={event => {
				if (event.target === event.currentTarget) onClose()
			}}
		>
			<div role="dialog" aria-modal="true" aria-label={title}>
				<h2>{title}</h2>
				{children}
			</div>
		</div>,
		document.body
	)
}
// #endregion

// #region RX-11 | Императивная ручка
/**
 * useImperativeHandle задаёт, ЧТО именно увидит родитель: только focus и clear.
 * Отдать наружу сам input нельзя — родитель получит доступ ко всему DOM-узлу
 * и начнёт трогать то, что компонент не обещал.
 */
export type TextInputHandle = { focus: () => void; clear: () => void }

export function TextInput({ label, ref }: { label: string; ref?: Ref<TextInputHandle> }) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [value, setValue] = useState('')

	useImperativeHandle(
		ref,
		() => ({
			focus: () => inputRef.current?.focus(),
			clear: () => setValue(''),
		}),
		[]
	)

	return (
		<label>
			{label}
			<input ref={inputRef} value={value} onChange={event => setValue(event.target.value)} />
		</label>
	)
}
// #endregion

// #region RX-12 | Мастер по шагам
/**
 * Одно число вместо набора флагов: любое состояние выражается через него,
 * и невозможно оказаться «одновременно на первом и последнем шаге».
 * Переход зажимается границами — кнопка может быть скрыта, но логика обязана быть честной.
 */
export function Wizard({ steps, onDone }: { steps: ReactNode[]; onDone: () => void }) {
	const [step, setStep] = useState(0)
	const isLast = step === steps.length - 1

	return (
		<div>
			<p>{`Шаг ${step + 1} из ${steps.length}`}</p>
			<div>{steps[step]}</div>

			{step > 0 ? <button onClick={() => setStep(current => Math.max(0, current - 1))}>Назад</button> : null}

			{isLast ? (
				<button onClick={onDone}>Готово</button>
			) : (
				<button onClick={() => setStep(current => Math.min(steps.length - 1, current + 1))}>Далее</button>
			)}
		</div>
	)
}
// #endregion

// #region RX-13 | Оптимистичное обновление
/**
 * Элемент добавляется до ответа сервера — интерфейс отвечает мгновенно.
 * Цена приёма — обязательный откат: в catch убираем ровно тот элемент, что добавили,
 * и показываем ошибку. Без отката пользователь увидит задачу, которой нет.
 */
export function OptimisticList({ items, onAdd }: { items: string[]; onAdd: (text: string) => Promise<void> }) {
	const [local, setLocal] = useState<string[]>([])
	const [text, setText] = useState('')
	const [failed, setFailed] = useState(false)
	const [pending, setPending] = useState(false)

	const submit = async (event: FormEvent) => {
		event.preventDefault()
		const value = text.trim()
		if (!value || pending) return

		setLocal(current => [...current, value])
		setText('')
		setFailed(false)
		setPending(true)

		try {
			await onAdd(value)
		} catch {
			setLocal(current => current.filter(item => item !== value))
			setFailed(true)
		} finally {
			setPending(false)
		}
	}

	return (
		<form onSubmit={submit}>
			<label>
				Новая задача
				<input value={text} onChange={event => setText(event.target.value)} />
			</label>
			<button type="submit" disabled={pending}>
				Добавить
			</button>

			{failed ? <p role="alert">Не удалось добавить</p> : null}

			<ul>
				{[...items, ...local].map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</form>
	)
}
// #endregion

// #region RX-14 | Композиция провайдеров
/**
 * reduceRight собирает вложенность: последний провайдер оказывается ближе всех к детям,
 * первый — самым внешним. Обычный reduce перевернул бы порядок.
 */
export const composeProviders = (
	...providers: Array<ComponentType<{ children: ReactNode }>>
): ComponentType<{ children: ReactNode }> => {
	const Composed = ({ children }: { children: ReactNode }) =>
		providers.reduceRight<ReactNode>((acc, Provider) => <Provider>{acc}</Provider>, children)

	Composed.displayName = 'ComposedProviders'
	return Composed
}
// #endregion

// #region RX-15 | Состояние на два режима
/**
 * Тот же приём, что в RX-05, но вынесенный в хук: именно так он живёт
 * во всех библиотеках компонентов.
 * onChange вызывается в обоих режимах — иначе неуправляемый компонент
 * не сможет сообщить родителю, что значение поменялось.
 */
export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: {
	value?: T
	defaultValue: T
	onChange?: (value: T) => void
}): [T, (value: T) => void] {
	const [inner, setInner] = useState(defaultValue)
	const controlled = value !== undefined

	const setValue = useCallback(
		(next: T) => {
			if (!controlled) setInner(next)
			onChange?.(next)
		},
		[controlled, onChange]
	)

	return [controlled ? value : inner, setValue]
}
// #endregion

// #region RX-16 | Провайдер выбора
/**
 * Массив, а не Set, потому что значение контекста должно меняться по ссылке:
 * мутация Set не вызовет перерисовку.
 * Порядок добавления сохраняется — по нему потом строят «выбрано N строк».
 */
type SelectionValue = {
	selected: number[]
	isSelected: (id: number) => boolean
	toggle: (id: number) => void
	clear: () => void
}
const SelectionContext = createContext<SelectionValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
	const [selected, setSelected] = useState<number[]>([])

	const value = useMemo<SelectionValue>(
		() => ({
			selected,
			isSelected: (id: number) => selected.includes(id),
			toggle: (id: number) =>
				setSelected(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id])),
			clear: () => setSelected([]),
		}),
		[selected]
	)

	return <SelectionContext value={value}>{children}</SelectionContext>
}

export function useSelection(): SelectionValue {
	const value = useContext(SelectionContext)
	if (!value) throw new Error('useSelection можно вызывать только внутри SelectionProvider')
	return value
}
// #endregion

// #region RX-17 | Поле формы с подписью и ошибкой
/**
 * useId даёт стабильный уникальный идентификатор, одинаковый на сервере и клиенте.
 * Ручные счётчики ломают гидратацию, а жёстко зашитый id ломается на втором поле.
 * aria-describedby связывает поле с текстом ошибки — без этого скринридер
 * прочитает поле и промолчит про ошибку.
 */
export function FormField({
	label,
	error,
	value,
	onChange,
}: {
	label: string
	error?: string
	value: string
	onChange: (value: string) => void
}) {
	const id = useId()
	const errorId = `${id}-error`

	return (
		<div>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				value={value}
				aria-invalid={error ? true : undefined}
				aria-describedby={error ? errorId : undefined}
				onChange={event => onChange(event.target.value)}
			/>
			{error ? (
				<p id={errorId} role="alert">
					{error}
				</p>
			) : null}
		</div>
	)
}
// #endregion

// #region RX-18 | Очередь уведомлений
/**
 * Таймеры держатся в ref и снимаются при размонтировании: иначе setState прилетит
 * в уже удалённый компонент.
 * id выдаётся счётчиком в ref, а не Date.now(): два тоста в одну миллисекунду
 * получили бы одинаковый ключ.
 */
export type Toast = { id: number; text: string }

type ToastsValue = { toasts: Toast[]; add: (text: string) => number; remove: (id: number) => void }
const ToastContext = createContext<ToastsValue | null>(null)

export function ToastProvider({ children, duration = 3000 }: { children: ReactNode; duration?: number }) {
	const [toasts, setToasts] = useState<Toast[]>([])
	const nextId = useRef(1)
	const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

	useEffect(() => () => timers.current.forEach(clearTimeout), [])

	const remove = useCallback((id: number) => setToasts(current => current.filter(toast => toast.id !== id)), [])

	const add = useCallback(
		(text: string) => {
			const id = nextId.current++
			setToasts(current => [...current, { id, text }])
			timers.current.push(setTimeout(() => remove(id), duration))
			return id
		},
		[duration, remove]
	)

	const value = useMemo<ToastsValue>(() => ({ toasts, add, remove }), [toasts, add, remove])

	return (
		<ToastContext value={value}>
			{children}
			<ul>
				{toasts.map(toast => (
					<li key={toast.id} role="status">
						{toast.text}
					</li>
				))}
			</ul>
		</ToastContext>
	)
}

export function useToasts(): ToastsValue {
	const value = useContext(ToastContext)
	if (!value) throw new Error('useToasts можно вызывать только внутри ToastProvider')
	return value
}
// #endregion

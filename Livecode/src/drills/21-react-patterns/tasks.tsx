import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

/**
 * ПРАВИЛА ПАКА
 * 1. Здесь проверяют API компонента, а не разметку. Прежде чем писать, скажи вслух:
 *    какие пропсы, что внутри состояния, что уходит наружу.
 * 2. Контекст без провайдера — это ошибка разработчика. Хук обязан бросать понятный текст,
 *    а не молча возвращать undefined.
 * 3. Компонент, у которого есть value и нет onChange, — сломанный компонент.
 *    Управляемый и неуправляемый режимы разводить явно.
 * 4. Тексты и роли в разметке должны совпадать с условием дословно: тесты ищут по ним.
 */

// #region RX-01 | Контекст и хук доступа | ★★☆
/**
 * Провайдер темы и хук к нему:
 *  - ThemeProvider принимает initial ('light' по умолчанию) и children;
 *  - useTheme возвращает { theme, toggle };
 *  - вызов useTheme вне провайдера бросает Error с текстом
 *    'useTheme можно вызывать только внутри ThemeProvider'.
 *
 * Значение контекста обязательно мемоизировать: иначе каждый рендер провайдера
 * перерисует всех потребителей.
 */
export type Theme = 'light' | 'dark'

export function ThemeProvider({ initial, children }: { initial?: Theme; children: ReactNode }) {
	return <div data-initial={initial}>{children}</div>
}

export function useTheme(): { theme: Theme; toggle: () => void } {
	return { theme: 'light', toggle: () => undefined }
}
// #endregion

// #region RX-02 | Составной компонент | ★★★
/**
 * Вкладки, где состояние живёт в родителе, а разметку собирает пользователь:
 *
 *   <Tabs defaultValue="a">
 *     <Tabs.List><Tabs.Tab value="a">А</Tabs.Tab><Tabs.Tab value="b">Б</Tabs.Tab></Tabs.List>
 *     <Tabs.Panel value="a">Панель А</Tabs.Panel>
 *     <Tabs.Panel value="b">Панель Б</Tabs.Panel>
 *   </Tabs>
 *
 * Требования: List — role="tablist", Tab — role="tab" и aria-selected,
 * активная панель одна, неактивные не рендерятся вовсе.
 */
export const Tabs = Object.assign(
	function TabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
		return <div data-default={defaultValue}>{children}</div>
	},
	{
		List: function TabsList({ children }: { children: ReactNode }) {
			return <div>{children}</div>
		},
		Tab: function Tab({ value, children }: { value: string; children: ReactNode }) {
			return <button data-value={value}>{children}</button>
		},
		Panel: function TabPanel({ value, children }: { value: string; children: ReactNode }) {
			return <div data-value={value}>{children}</div>
		},
	}
)
// #endregion

// #region RX-03 | Render-props | ★★☆
/**
 * Компонент отдаёт состояние, а разметку рисует вызывающий:
 *
 *   <Toggle>{({ on, toggle }) => <button onClick={toggle}>{on ? 'вкл' : 'выкл'}</button>}</Toggle>
 *
 * Приём старый, но именно из него выросли хуки — уметь объяснить связь.
 */
export function Toggle({
	initial,
	children,
}: {
	initial?: boolean
	children: (state: { on: boolean; toggle: () => void }) => ReactNode
}) {
	return <>{children({ on: initial ?? false, toggle: () => undefined })}</>
}
// #endregion

// #region RX-04 | Компонент высшего порядка | ★★☆
/**
 * Обёртка, добавляющая пропс loading: при true рисуется <p>Загрузка…</p>,
 * иначе исходный компонент со своими пропсами (loading внутрь НЕ пробрасывается).
 * displayName обязателен: 'withLoading(ИмяКомпонента)' — иначе в девтулзах каша.
 */
export function withLoading<P extends object>(Component: ComponentType<P>): ComponentType<P & { loading: boolean }> {
	return function Wrapped(props: P & { loading: boolean }) {
		return <Component {...(props as P)} />
	}
}
// #endregion

// #region RX-05 | Управляемый и неуправляемый | ★★★
/**
 * Поле с подписью «Имя», работающее в двух режимах:
 *  - передали value → состояние снаружи, компонент только сообщает об изменении;
 *  - передали только defaultValue → состояние внутри.
 * Переключать режим на лету нельзя — это ошибка использования,
 * и React за это ругается в консоль. Уметь объяснить почему.
 */
export function NameInput({
	value,
	defaultValue,
	onChange,
}: {
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
}) {
	return (
		<label>
			Имя
			<input value={value ?? defaultValue ?? ''} onChange={event => onChange?.(event.target.value)} />
		</label>
	)
}
// #endregion

// #region RX-06 | Форма на useReducer | ★★★
/**
 * Чистый редьюсер формы — его и проверяют отдельно от разметки.
 * Действия: change (name, value), blur (name), submit, reset.
 *  - change пишет значение;
 *  - blur помечает поле тронутым;
 *  - submit ставит submitted: true и помечает тронутыми ВСЕ поля;
 *  - reset возвращает начальное состояние.
 * Редьюсер обязан быть чистым: новый объект, без мутаций.
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
	return state
}
// #endregion

// #region RX-07 | Слоты | ★★☆
/**
 * Карточка, куда разметку передают пропсами-узлами:
 *  - title рисуется в <header>, footer — в <footer>;
 *  - пустой слот не создаёт пустой узел (нет title — нет <header>);
 *  - children всегда внутри <div class="card-body">.
 */
export function Card({ title, footer, children }: { title?: ReactNode; footer?: ReactNode; children: ReactNode }) {
	return <div>{children}</div>
}
// #endregion

// #region RX-08 | Полиморфный компонент | ★★★
/**
 * Один компонент — любой тег: <Box as="a" href="/x">. По умолчанию div.
 * Пропсы должны типизироваться по выбранному тегу — это и есть сложность задачи.
 */
export type BoxProps<E extends ElementType> = { as?: E } & Omit<ComponentPropsWithoutRef<E>, 'as'>

export function Box<E extends ElementType = 'div'>(_props: BoxProps<E>) {
	return <div>заглушка</div>
}
// #endregion

// #region RX-09 | Граница ошибок | ★★★
/**
 * Единственное, что до сих пор требует классового компонента.
 *  - поймав ошибку, рисует <p>Что-то сломалось</p> и кнопку «Повторить»;
 *  - «Повторить» сбрасывает состояние и снова показывает детей;
 *  - если передан onError — вызвать его с ошибкой.
 * Границы НЕ ловят ошибки в обработчиках событий и в асинхронном коде — знать обязательно.
 */
export class ErrorBoundary extends Component<
	{ children: ReactNode; onError?: (error: Error) => void },
	{ error: Error | null }
> {
	state = { error: null as Error | null }

	render() {
		return this.props.children
	}
}
// #endregion

// #region RX-10 | Портал | ★★★
/**
 * Модалка, которая рендерится в document.body, а не в месте вызова —
 * иначе overflow: hidden у родителя обрежет её.
 *  - open: false → не рендерить ничего;
 *  - role="dialog", aria-modal="true", заголовок из title;
 *  - Escape и клик по фону (data-testid="overlay") вызывают onClose;
 *  - клик по содержимому окна onClose НЕ вызывает.
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
	return open ? <div>{children}</div> : null
}
// #endregion

// #region RX-11 | Императивная ручка | ★★★
/**
 * Иногда родителю нужно дёрнуть компонент напрямую: сфокусировать поле после ошибки.
 * Наружу отдаём ТОЛЬКО разрешённые методы — focus() и clear(), а не весь DOM-узел.
 * В React 19 ref приходит обычным пропсом, forwardRef не нужен; сам объект ручки
 * собирается через useImperativeHandle. Поле подписано словом «Имя».
 */
export type TextInputHandle = { focus: () => void; clear: () => void }

export function TextInput(_props: { label: string; ref?: Ref<TextInputHandle> }) {
	return <input />
}
// #endregion

// #region RX-12 | Мастер по шагам | ★★★
/**
 * Пошаговая форма:
 *  - показывает текущий шаг и строку «Шаг N из M»;
 *  - «Назад» скрыта на первом шаге;
 *  - на последнем шаге вместо «Далее» — «Готово», она вызывает onDone;
 *  - состояние шага держать числом, а не тремя булевыми флагами.
 */
export function Wizard({ steps, onDone }: { steps: ReactNode[]; onDone: () => void }) {
	return <div>{steps[0]}</div>
}
// #endregion

// #region RX-13 | Оптимистичное обновление | ★★★
/**
 * Список задач, который добавляет элемент СРАЗУ, не дожидаясь сервера:
 *  - поле «Новая задача» и кнопка «Добавить»;
 *  - после отправки элемент виден мгновенно;
 *  - onAdd отклонился → элемент убрать и показать <p role="alert">Не удалось добавить</p>;
 *  - пока запрос идёт, повторная отправка того же текста не нужна — кнопка отключена.
 */
export function OptimisticList({ items, onAdd }: { items: string[]; onAdd: (text: string) => Promise<void> }) {
	return (
		<ul>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}
// #endregion

// #region RX-14 | Композиция провайдеров | ★★☆
/**
 * Лестница из шести провайдеров в корне приложения читается плохо.
 * Собрать их в один компонент: первый в списке — самый внешний.
 *
 *   const Providers = composeProviders(ThemeProvider, AuthProvider)
 */
export const composeProviders = (
	...providers: Array<ComponentType<{ children: ReactNode }>>
): ComponentType<{ children: ReactNode }> => {
	return function Composed({ children }: { children: ReactNode }) {
		return <>{children}</>
	}
}
// #endregion

// #region RX-15 | Состояние на два режима | ★★★
/**
 * Хук, из которого растёт RX-05: работает и как управляемое, и как неуправляемое состояние.
 *  - передали value → возвращать его, а setState только звать onChange;
 *  - не передали → держать состояние внутри и всё равно звать onChange.
 */
export function useControllableState<T>(options: {
	value?: T
	defaultValue: T
	onChange?: (value: T) => void
}): [T, (value: T) => void] {
	return [options.value ?? options.defaultValue, () => undefined]
}
// #endregion

// #region RX-16 | Провайдер выбора | ★★☆
/**
 * Множественный выбор строк таблицы через контекст:
 *  - useSelection даёт { selected, isSelected, toggle, clear };
 *  - selected — массив в порядке добавления;
 *  - вне провайдера хук бросает Error с текстом
 *    'useSelection можно вызывать только внутри SelectionProvider'.
 */
export function SelectionProvider({ children }: { children: ReactNode }) {
	return <>{children}</>
}

export function useSelection(): {
	selected: number[]
	isSelected: (id: number) => boolean
	toggle: (id: number) => void
	clear: () => void
} {
	return { selected: [], isSelected: () => false, toggle: () => undefined, clear: () => undefined }
}
// #endregion

// #region RX-17 | Поле формы с подписью и ошибкой | ★★☆
/**
 * Доступная связка, которую просят на каждом втором собесе:
 *  - label связан с input через id (брать из useId, а не придумывать руками);
 *  - есть error → <p role="alert"> с текстом, input получает aria-invalid="true"
 *    и aria-describedby с id этого сообщения;
 *  - нет ошибки → ни alert, ни aria-invalid.
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
	return (
		<label>
			{label}
			<input value={value} onChange={event => onChange(event.target.value)} />
		</label>
	)
}
// #endregion

// #region RX-18 | Очередь уведомлений | ★★★
/**
 * Провайдер тостов:
 *  - useToasts даёт { toasts, add, remove };
 *  - add возвращает id, тост сам исчезает через duration мс (по умолчанию 3000);
 *  - список рисуется как <ul>, каждый тост — <li role="status">;
 *  - при размонтировании таймеры обязаны сниматься, иначе setState на мёртвом компоненте.
 */
export type Toast = { id: number; text: string }

export function ToastProvider({ children, duration }: { children: ReactNode; duration?: number }) {
	return <div data-duration={duration}>{children}</div>
}

export function useToasts(): { toasts: Toast[]; add: (text: string) => number; remove: (id: number) => void } {
	return { toasts: [], add: () => 0, remove: () => undefined }
}
// #endregion

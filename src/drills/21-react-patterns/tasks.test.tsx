// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	Box,
	Card,
	ErrorBoundary,
	FormField,
	Modal,
	NameInput,
	OptimisticList,
	SelectionProvider,
	Tabs,
	TextInput,
	ThemeProvider,
	ToastProvider,
	Toggle,
	Wizard,
	composeProviders,
	formReducer,
	initialFormState,
	useControllableState,
	useSelection,
	useTheme,
	useToasts,
	withLoading,
	type TextInputHandle,
} from './tasks'

afterEach(cleanup)

/** Ошибки React в тестах границ и контекста — ожидаемый шум, глушим. */
const silenceErrors = () => vi.spyOn(console, 'error').mockImplementation(() => undefined)

// #region RX-01
describe('RX-01 ThemeProvider / useTheme', () => {
	function ThemeView() {
		const { theme, toggle } = useTheme()
		return (
			<div>
				<p>{`Тема: ${theme}`}</p>
				<button onClick={toggle}>Сменить</button>
			</div>
		)
	}

	it('отдаёт тему по умолчанию', () => {
		render(
			<ThemeProvider>
				<ThemeView />
			</ThemeProvider>
		)
		expect(screen.getByText('Тема: light')).toBeInTheDocument()
	})

	it('принимает начальную тему', () => {
		render(
			<ThemeProvider initial="dark">
				<ThemeView />
			</ThemeProvider>
		)
		expect(screen.getByText('Тема: dark')).toBeInTheDocument()
	})

	it('переключает тему', async () => {
		render(
			<ThemeProvider>
				<ThemeView />
			</ThemeProvider>
		)
		await userEvent.click(screen.getByRole('button', { name: 'Сменить' }))
		expect(screen.getByText('Тема: dark')).toBeInTheDocument()
	})

	it('вне провайдера бросает понятную ошибку', () => {
		silenceErrors()
		expect(() => renderHook(() => useTheme())).toThrow('useTheme можно вызывать только внутри ThemeProvider')
	})
})
// #endregion

// #region RX-02
describe('RX-02 Tabs', () => {
	const setup = () =>
		render(
			<Tabs defaultValue="a">
				<Tabs.List>
					<Tabs.Tab value="a">Первая</Tabs.Tab>
					<Tabs.Tab value="b">Вторая</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="a">Панель А</Tabs.Panel>
				<Tabs.Panel value="b">Панель Б</Tabs.Panel>
			</Tabs>
		)

	it('роли расставлены', () => {
		setup()
		expect(screen.getByRole('tablist')).toBeInTheDocument()
		expect(screen.getAllByRole('tab')).toHaveLength(2)
	})

	it('по умолчанию открыта первая панель', () => {
		setup()
		expect(screen.getByText('Панель А')).toBeInTheDocument()
		expect(screen.queryByText('Панель Б')).not.toBeInTheDocument()
	})

	it('активная вкладка помечена', () => {
		setup()
		expect(screen.getByRole('tab', { name: 'Первая' })).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByRole('tab', { name: 'Вторая' })).toHaveAttribute('aria-selected', 'false')
	})

	it('клик переключает панель', async () => {
		setup()
		await userEvent.click(screen.getByRole('tab', { name: 'Вторая' }))

		expect(screen.getByText('Панель Б')).toBeInTheDocument()
		expect(screen.queryByText('Панель А')).not.toBeInTheDocument()
	})
})
// #endregion

// #region RX-03
describe('RX-03 Toggle', () => {
	const setup = () =>
		render(
			<Toggle>
				{({ on, toggle }) => (
					<button onClick={toggle}>{on ? 'включено' : 'выключено'}</button>
				)}
			</Toggle>
		)

	it('отдаёт начальное состояние', () => {
		setup()
		expect(screen.getByRole('button', { name: 'выключено' })).toBeInTheDocument()
	})

	it('переключается', async () => {
		setup()
		await userEvent.click(screen.getByRole('button'))
		expect(screen.getByRole('button', { name: 'включено' })).toBeInTheDocument()
	})

	it('принимает начальное значение', () => {
		render(<Toggle initial>{({ on }) => <span>{String(on)}</span>}</Toggle>)
		expect(screen.getByText('true')).toBeInTheDocument()
	})
})
// #endregion

// #region RX-04
describe('RX-04 withLoading', () => {
	function Profile({ name }: { name: string }) {
		return <p>{`Профиль ${name}`}</p>
	}
	const ProfileWithLoading = withLoading(Profile)

	it('показывает загрузку', () => {
		render(<ProfileWithLoading loading name="Ян" />)
		expect(screen.getByText('Загрузка…')).toBeInTheDocument()
	})

	it('показывает компонент', () => {
		render(<ProfileWithLoading loading={false} name="Ян" />)
		expect(screen.getByText('Профиль Ян')).toBeInTheDocument()
	})

	it('loading внутрь не пробрасывается', () => {
		const spy = vi.fn((props: { name: string }) => <p>{props.name}</p>)
		const Wrapped = withLoading(spy)
		render(<Wrapped loading={false} name="Ян" />)

		expect(Object.keys(spy.mock.calls[0][0])).toEqual(['name'])
	})

	it('displayName собирается из имени компонента', () => {
		expect(ProfileWithLoading.displayName).toBe('withLoading(Profile)')
	})
})
// #endregion

// #region RX-05
describe('RX-05 NameInput', () => {
	it('неуправляемый режим хранит значение внутри', async () => {
		render(<NameInput defaultValue="Ян" />)
		const input = screen.getByLabelText('Имя')

		await userEvent.type(input, 'а')
		expect(input).toHaveValue('Яна')
	})

	it('управляемый режим не меняет значение сам', async () => {
		const onChange = vi.fn()
		render(<NameInput value="Ян" onChange={onChange} />)
		const input = screen.getByLabelText('Имя')

		await userEvent.type(input, 'а')
		expect(input).toHaveValue('Ян')
		expect(onChange).toHaveBeenCalledWith('Яна')
	})

	it('в неуправляемом режиме onChange тоже вызывается', async () => {
		const onChange = vi.fn()
		render(<NameInput defaultValue="" onChange={onChange} />)

		await userEvent.type(screen.getByLabelText('Имя'), 'Я')
		expect(onChange).toHaveBeenCalledWith('Я')
	})

	it('без пропсов поле пустое', () => expect(render(<NameInput />).container.querySelector('input')).toHaveValue(''))
})
// #endregion

// #region RX-06
describe('RX-06 formReducer', () => {
	const state = initialFormState({ name: '', email: '' })

	it('change пишет значение', () => {
		const next = formReducer(state, { type: 'change', name: 'name', value: 'Ян' })
		expect(next.values).toEqual({ name: 'Ян', email: '' })
	})

	it('blur помечает поле тронутым', () => {
		expect(formReducer(state, { type: 'blur', name: 'email' }).touched).toEqual({ email: true })
	})

	it('submit помечает все поля и ставит флаг', () => {
		const next = formReducer(state, { type: 'submit' })
		expect(next.submitted).toBe(true)
		expect(next.touched).toEqual({ name: true, email: true })
	})

	it('reset возвращает начальное состояние', () => {
		const dirty = formReducer(formReducer(state, { type: 'submit' }), {
			type: 'change',
			name: 'name',
			value: 'Ян',
		})
		expect(formReducer(dirty, { type: 'reset' })).toEqual({
			values: { name: 'Ян', email: '' },
			touched: {},
			submitted: false,
		})
	})

	it('редьюсер чистый: старое состояние не меняется', () => {
		formReducer(state, { type: 'change', name: 'name', value: 'Ян' })
		expect(state.values.name).toBe('')
	})

	it('возвращает новый объект', () => {
		expect(formReducer(state, { type: 'blur', name: 'name' })).not.toBe(state)
	})
})
// #endregion

// #region RX-07
describe('RX-07 Card', () => {
	it('рисует слоты', () => {
		const { container } = render(
			<Card title={<h3>Заголовок</h3>} footer={<span>Низ</span>}>
				Тело
			</Card>
		)
		expect(container.querySelector('header')?.textContent).toBe('Заголовок')
		expect(container.querySelector('footer')?.textContent).toBe('Низ')
		expect(container.querySelector('.card-body')?.textContent).toBe('Тело')
	})

	it('пустой слот не создаёт узел', () => {
		const { container } = render(<Card>Тело</Card>)
		expect(container.querySelector('header')).toBeNull()
		expect(container.querySelector('footer')).toBeNull()
	})
})
// #endregion

// #region RX-08
describe('RX-08 Box', () => {
	it('по умолчанию div', () => {
		const { container } = render(<Box>текст</Box>)
		expect(container.firstElementChild?.tagName).toBe('DIV')
	})

	it('меняет тег', () => {
		render(
			<Box as="a" href="/x">
				ссылка
			</Box>
		)
		expect(screen.getByRole('link', { name: 'ссылка' })).toHaveAttribute('href', '/x')
	})

	it('пропсы тега работают', () => {
		render(<Box as="button" type="button" disabled />)
		expect(screen.getByRole('button')).toBeDisabled()
	})
})
// #endregion

// #region RX-09
describe('RX-09 ErrorBoundary', () => {
	function Boom({ crash }: { crash: boolean }) {
		if (crash) throw new Error('сломалось')
		return <p>Всё хорошо</p>
	}

	beforeEach(silenceErrors)

	it('ловит ошибку рендера', () => {
		render(
			<ErrorBoundary>
				<Boom crash />
			</ErrorBoundary>
		)
		expect(screen.getByText('Что-то сломалось')).toBeInTheDocument()
	})

	it('без ошибки рисует детей', () => {
		render(
			<ErrorBoundary>
				<Boom crash={false} />
			</ErrorBoundary>
		)
		expect(screen.getByText('Всё хорошо')).toBeInTheDocument()
	})

	it('сообщает об ошибке наружу', () => {
		const onError = vi.fn()
		render(
			<ErrorBoundary onError={onError}>
				<Boom crash />
			</ErrorBoundary>
		)
		expect(onError).toHaveBeenCalled()
	})

	it('кнопка «Повторить» сбрасывает состояние', async () => {
		function Host() {
			const [crash, setCrash] = useState(true)
			return (
				<>
					<button onClick={() => setCrash(false)}>Починить</button>
					<ErrorBoundary>
						<Boom crash={crash} />
					</ErrorBoundary>
				</>
			)
		}
		render(<Host />)

		expect(screen.getByText('Что-то сломалось')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Починить' }))
		await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))

		expect(screen.getByText('Всё хорошо')).toBeInTheDocument()
	})
})
// #endregion

// #region RX-10
describe('RX-10 Modal', () => {
	it('закрытая модалка ничего не рисует', () => {
		const { container } = render(
			<Modal open={false} title="Окно" onClose={vi.fn()}>
				тело
			</Modal>
		)
		expect(container).toBeEmptyDOMElement()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('рендерится в body, а не на месте вызова', () => {
		const { container } = render(
			<Modal open title="Окно" onClose={vi.fn()}>
				тело
			</Modal>
		)
		expect(container.querySelector('[role="dialog"]')).toBeNull()
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	it('атрибуты доступности на месте', () => {
		render(
			<Modal open title="Окно" onClose={vi.fn()}>
				тело
			</Modal>
		)
		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
		expect(screen.getByText('Окно')).toBeInTheDocument()
	})

	it('Escape закрывает', () => {
		const onClose = vi.fn()
		render(
			<Modal open title="Окно" onClose={onClose}>
				тело
			</Modal>
		)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('клик по фону закрывает, по содержимому — нет', async () => {
		const onClose = vi.fn()
		render(
			<Modal open title="Окно" onClose={onClose}>
				<button>внутри</button>
			</Modal>
		)

		await userEvent.click(screen.getByRole('button', { name: 'внутри' }))
		expect(onClose).not.toHaveBeenCalled()

		await userEvent.click(screen.getByTestId('overlay'))
		expect(onClose).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region RX-11
describe('RX-11 TextInput', () => {
	it('focus через ручку', () => {
		const ref = createRef<TextInputHandle>()
		render(<TextInput label="Имя" ref={ref} />)

		act(() => ref.current?.focus())
		expect(document.activeElement).toBe(screen.getByLabelText('Имя'))
	})

	it('clear очищает поле', async () => {
		const ref = createRef<TextInputHandle>()
		render(<TextInput label="Имя" ref={ref} />)

		await userEvent.type(screen.getByLabelText('Имя'), 'Ян')
		act(() => ref.current?.clear())

		expect(screen.getByLabelText('Имя')).toHaveValue('')
	})

	it('наружу торчат только разрешённые методы', () => {
		const ref = createRef<TextInputHandle>()
		render(<TextInput label="Имя" ref={ref} />)

		expect(Object.keys(ref.current ?? {}).sort()).toEqual(['clear', 'focus'])
	})
})
// #endregion

// #region RX-12
describe('RX-12 Wizard', () => {
	const steps = [<p key="1">Шаг первый</p>, <p key="2">Шаг второй</p>, <p key="3">Шаг третий</p>]

	it('показывает первый шаг и счётчик', () => {
		render(<Wizard steps={steps} onDone={vi.fn()} />)
		expect(screen.getByText('Шаг первый')).toBeInTheDocument()
		expect(screen.getByText('Шаг 1 из 3')).toBeInTheDocument()
	})

	it('на первом шаге нет кнопки «Назад»', () => {
		render(<Wizard steps={steps} onDone={vi.fn()} />)
		expect(screen.queryByRole('button', { name: 'Назад' })).not.toBeInTheDocument()
	})

	it('идёт вперёд и назад', async () => {
		render(<Wizard steps={steps} onDone={vi.fn()} />)

		await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
		expect(screen.getByText('Шаг второй')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Назад' }))
		expect(screen.getByText('Шаг первый')).toBeInTheDocument()
	})

	it('на последнем шаге кнопка «Готово»', async () => {
		const onDone = vi.fn()
		render(<Wizard steps={steps} onDone={onDone} />)

		await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
		await userEvent.click(screen.getByRole('button', { name: 'Далее' }))

		expect(screen.queryByRole('button', { name: 'Далее' })).not.toBeInTheDocument()
		await userEvent.click(screen.getByRole('button', { name: 'Готово' }))
		expect(onDone).toHaveBeenCalledTimes(1)
	})
})
// #endregion

// #region RX-13
describe('RX-13 OptimisticList', () => {
	it('показывает элемент до ответа сервера', async () => {
		let resolve: () => void = () => undefined
		const onAdd = vi.fn(() => new Promise<void>(done => (resolve = done)))

		render(<OptimisticList items={['старая']} onAdd={onAdd} />)
		await userEvent.type(screen.getByLabelText('Новая задача'), 'новая')
		await userEvent.click(screen.getByRole('button', { name: 'Добавить' }))

		expect(screen.getByText('новая')).toBeInTheDocument()
		await act(async () => resolve())
	})

	it('откатывает при ошибке', async () => {
		const onAdd = vi.fn(async () => {
			throw new Error('сервер лёг')
		})

		render(<OptimisticList items={[]} onAdd={onAdd} />)
		await userEvent.type(screen.getByLabelText('Новая задача'), 'новая')
		await userEvent.click(screen.getByRole('button', { name: 'Добавить' }))

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось добавить'))
		expect(screen.queryByText('новая')).not.toBeInTheDocument()
	})

	it('очищает поле после отправки', async () => {
		render(<OptimisticList items={[]} onAdd={async () => undefined} />)

		await userEvent.type(screen.getByLabelText('Новая задача'), 'новая')
		await userEvent.click(screen.getByRole('button', { name: 'Добавить' }))

		expect(screen.getByLabelText('Новая задача')).toHaveValue('')
	})

	it('пустая строка не добавляется', async () => {
		const onAdd = vi.fn(async () => undefined)
		render(<OptimisticList items={[]} onAdd={onAdd} />)

		await userEvent.type(screen.getByLabelText('Новая задача'), '   ')
		await userEvent.click(screen.getByRole('button', { name: 'Добавить' }))

		expect(onAdd).not.toHaveBeenCalled()
	})
})
// #endregion

// #region RX-14
describe('RX-14 composeProviders', () => {
	const makeProvider = (mark: string) =>
		function Provider({ children }: { children: ReactNode }) {
			return (
				<div data-mark={mark}>
					{mark}
					{children}
				</div>
			)
		}

	it('оборачивает детей всеми провайдерами', () => {
		const Providers = composeProviders(makeProvider('A'), makeProvider('B'))
		render(
			<Providers>
				<p>дети</p>
			</Providers>
		)
		expect(screen.getByText('дети')).toBeInTheDocument()
		expect(screen.getByText('A')).toBeInTheDocument()
		expect(screen.getByText('B')).toBeInTheDocument()
	})

	it('первый в списке — самый внешний', () => {
		const Providers = composeProviders(makeProvider('A'), makeProvider('B'))
		const { container } = render(
			<Providers>
				<p>дети</p>
			</Providers>
		)

		const outer = container.querySelector('[data-mark="A"]')
		expect(outer?.querySelector('[data-mark="B"]')).not.toBeNull()
	})

	it('без провайдеров просто отдаёт детей', () => {
		const Providers = composeProviders()
		render(
			<Providers>
				<p>дети</p>
			</Providers>
		)
		expect(screen.getByText('дети')).toBeInTheDocument()
	})
})
// #endregion

// #region RX-15
describe('RX-15 useControllableState', () => {
	it('неуправляемый режим держит состояние внутри', () => {
		const { result } = renderHook(() => useControllableState({ defaultValue: 1 }))

		act(() => result.current[1](5))
		expect(result.current[0]).toBe(5)
	})

	it('управляемый режим состояние не меняет', () => {
		const onChange = vi.fn()
		const { result } = renderHook(() => useControllableState({ value: 1, defaultValue: 0, onChange }))

		act(() => result.current[1](5))
		expect(result.current[0]).toBe(1)
		expect(onChange).toHaveBeenCalledWith(5)
	})

	it('в неуправляемом режиме onChange тоже зовётся', () => {
		const onChange = vi.fn()
		const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }))

		act(() => result.current[1](3))
		expect(onChange).toHaveBeenCalledWith(3)
	})
})
// #endregion

// #region RX-16
describe('RX-16 SelectionProvider', () => {
	const wrapper = ({ children }: { children: ReactNode }) => <SelectionProvider>{children}</SelectionProvider>

	it('выбирает и снимает выбор', () => {
		const { result } = renderHook(() => useSelection(), { wrapper })

		act(() => result.current.toggle(1))
		expect(result.current.isSelected(1)).toBe(true)

		act(() => result.current.toggle(1))
		expect(result.current.isSelected(1)).toBe(false)
	})

	it('порядок добавления сохраняется', () => {
		const { result } = renderHook(() => useSelection(), { wrapper })

		act(() => result.current.toggle(5))
		act(() => result.current.toggle(2))
		expect(result.current.selected).toEqual([5, 2])
	})

	it('clear снимает всё', () => {
		const { result } = renderHook(() => useSelection(), { wrapper })

		act(() => result.current.toggle(1))
		act(() => result.current.clear())
		expect(result.current.selected).toEqual([])
	})

	it('вне провайдера бросает ошибку', () => {
		silenceErrors()
		expect(() => renderHook(() => useSelection())).toThrow(
			'useSelection можно вызывать только внутри SelectionProvider'
		)
	})
})
// #endregion

// #region RX-17
describe('RX-17 FormField', () => {
	it('подпись связана с полем', () => {
		render(<FormField label="Почта" value="" onChange={vi.fn()} />)
		expect(screen.getByLabelText('Почта')).toBeInTheDocument()
	})

	it('без ошибки нет alert и aria-invalid', () => {
		render(<FormField label="Почта" value="" onChange={vi.fn()} />)
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
		expect(screen.getByLabelText('Почта')).not.toHaveAttribute('aria-invalid')
	})

	it('ошибка помечает поле и связывается с ним', () => {
		render(<FormField label="Почта" error="Неверная почта" value="" onChange={vi.fn()} />)

		const input = screen.getByLabelText('Почта')
		const alert = screen.getByRole('alert')

		expect(alert).toHaveTextContent('Неверная почта')
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(input.getAttribute('aria-describedby')).toBe(alert.getAttribute('id'))
	})

	it('два поля получают разные id', () => {
		render(
			<>
				<FormField label="Имя" value="" onChange={vi.fn()} />
				<FormField label="Почта" value="" onChange={vi.fn()} />
			</>
		)
		expect(screen.getByLabelText('Имя').id).not.toBe(screen.getByLabelText('Почта').id)
	})

	it('ввод уходит наружу', async () => {
		const onChange = vi.fn()
		render(<FormField label="Имя" value="" onChange={onChange} />)

		await userEvent.type(screen.getByLabelText('Имя'), 'Я')
		expect(onChange).toHaveBeenCalledWith('Я')
	})
})
// #endregion

// #region RX-18
describe('RX-18 ToastProvider', () => {
	function Panel() {
		const { add, remove, toasts } = useToasts()
		return (
			<div>
				<button onClick={() => add('Сохранено')}>Показать</button>
				<button onClick={() => toasts[0] && remove(toasts[0].id)}>Убрать</button>
			</div>
		)
	}

	it('показывает уведомление', async () => {
		render(
			<ToastProvider duration={5000}>
				<Panel />
			</ToastProvider>
		)
		await userEvent.click(screen.getByRole('button', { name: 'Показать' }))

		expect(screen.getByRole('status')).toHaveTextContent('Сохранено')
	})

	it('уведомление исчезает само', async () => {
		render(
			<ToastProvider duration={50}>
				<Panel />
			</ToastProvider>
		)
		await userEvent.click(screen.getByRole('button', { name: 'Показать' }))

		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument(), { timeout: 1000 })
	})

	it('можно убрать вручную', async () => {
		render(
			<ToastProvider duration={5000}>
				<Panel />
			</ToastProvider>
		)
		await userEvent.click(screen.getByRole('button', { name: 'Показать' }))
		await userEvent.click(screen.getByRole('button', { name: 'Убрать' }))

		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})

	it('несколько уведомлений живут одновременно', async () => {
		render(
			<ToastProvider duration={5000}>
				<Panel />
			</ToastProvider>
		)
		await userEvent.click(screen.getByRole('button', { name: 'Показать' }))
		await userEvent.click(screen.getByRole('button', { name: 'Показать' }))

		expect(screen.getAllByRole('status')).toHaveLength(2)
	})
})
// #endregion

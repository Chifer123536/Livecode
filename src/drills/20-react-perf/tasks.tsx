import type { ReactNode } from 'react'

/**
 * ПРАВИЛА ПАКА
 * 1. Когда React перерисовывает компонент: изменилось его состояние, изменился контекст,
 *    на который он подписан, или перерисовался родитель. Третий пункт — источник 90% лишних
 *    рендеров, и именно его лечит React.memo.
 * 2. React.memo сравнивает пропсы ПОВЕРХНОСТНО через Object.is. Новый объект, массив
 *    или стрелка в пропсах каждый раз ломают мемоизацию.
 * 3. Оптимизировать имеет смысл только то, что реально тормозит. На собесе после решения
 *    обязательно скажи: «сначала я бы замерил профайлером, а не мемоизировал всё подряд».
 * 4. Во всех задачах компоненты обязаны вызывать onRender() ПЕРВОЙ строкой тела —
 *    это инструментовка, по ней тесты считают количество рендеров.
 */

export type Counted = { onRender: () => void }

// #region RP-01 | Мемоизация дочернего компонента | ★★☆
/**
 * Parent держит счётчик и рендерит Child с НЕИЗМЕННЫМ пропсом title.
 * Сделать так, чтобы клик по кнопке «+1» перерисовывал только Parent, но не Child.
 *
 * Кнопка: «+1». Parent показывает «Счёт: N», Child показывает свой title.
 */
export function Child({ title, onRender }: { title: string } & Counted) {
	return <p>заглушка</p>
}
export function Parent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-02 | Стабильный обработчик | ★★★
/**
 * То же самое, но ребёнку передаётся колбэк onAction.
 * Без стабилизации новая стрелка на каждом рендере ломает memo.
 * Ребёнок мемоизирован и имеет кнопку «Действие», вызывающую onAction.
 *
 * Подсказка: setCount(c => c + 1) позволяет обойтись пустым массивом зависимостей.
 */
export function ActionChild({ onAction, onRender }: { onAction: () => void } & Counted) {
	return <button>заглушка</button>
}
export function ActionParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-03 | Стабильный объект в пропсах | ★★★
/**
 * Ребёнок мемоизирован и получает объект config = { theme: 'dark' }.
 * Объект НЕ должен пересоздаваться при перерисовке родителя.
 * Ребёнок выводит «Тема: dark».
 */
export function ConfigChild({ config, onRender }: { config: { theme: string } } & Counted) {
	return <p>заглушка</p>
}
export function ConfigParent({ childRender, parentRender }: { childRender: () => void; parentRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-04 | Дорогое вычисление | ★★☆
/**
 * Компонент принимает numbers и text. При вводе текста сумма чисел
 * пересчитываться НЕ должна.
 * Разметка: инпут с подписью «Текст» и абзац «Сумма: N».
 * calculate вызывается ровно там, где считается сумма, — тест считает его вызовы.
 */
export function ExpensiveSum({ numbers, calculate }: { numbers: number[]; calculate: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-05 | Свой компаратор в memo | ★★★
/**
 * Ребёнок получает объект user и должен перерисовываться ТОЛЬКО при смене user.id,
 * даже если пришёл новый объект с тем же id.
 * Выводит «Пользователь: {name}».
 */
export type User = { id: number; name: string }
export function UserCard({ user, onRender }: { user: User } & Counted) {
	return <p>заглушка</p>
}
// #endregion

// #region RP-06 | Ленивая инициализация состояния | ★★☆
/**
 * Начальное состояние считается дорогой функцией init.
 * init обязана выполниться ровно ОДИН раз за всё время жизни компонента,
 * а не на каждый рендер.
 * Разметка: «Значение: N» и кнопка «+1».
 *
 * Ловушка: useState(init()) вызывает init на каждом рендере,
 * useState(init) — только при монтировании.
 */
export function LazyInit({ init }: { init: () => number }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-07 | Ref вместо состояния | ★★☆
/**
 * Считать клики, но НЕ показывать счётчик — он нужен только при нажатии «Показать».
 * Каждый клик по «Клик» не должен вызывать перерисовку.
 * После «Показать» вывести «Кликов: N».
 */
export function ClickTracker({ onRender }: Counted) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-08 | children как пропс | ★★★
/**
 * Обёртка с собственным состоянием (кнопка «+1» и текст «Счёт: N»)
 * не должна перерисовывать дорогое содержимое.
 * Решение — принять его через children: React создаёт этот элемент СНАРУЖИ,
 * и при перерисовке обёртки ссылка на него не меняется.
 */
export function Expensive({ onRender }: Counted) {
	return <p>заглушка</p>
}
export function Wrapper({ children, onRender }: { children: ReactNode } & Counted) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-09 | Вынести состояние вниз | ★★★
/**
 * Есть дорогой список и поле ввода. Ввод текста не должен перерисовывать список.
 * Решение — опустить состояние инпута в отдельный маленький компонент.
 *
 * Разметка: инпут с подписью «Заметка», под ним список из items.
 */
export function HeavyList({ items, onRender }: { items: string[] } & Counted) {
	return <ul>заглушка</ul>
}
export function NotePanel({ items, listRender }: { items: string[]; listRender: () => void }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-10 | Мемоизированный элемент списка | ★★★
/**
 * Список задач с кнопкой удаления у каждой.
 * При удалении ОДНОГО элемента остальные перерисовываться не должны.
 * Требуется: memo на элементе, стабильный обработчик и передача id внутрь элемента
 * (а не стрелка `() => onRemove(item.id)` в родителе).
 *
 * У кнопки aria-label `Удалить ${title}`.
 * Внимание: onRender здесь принимает id и передаётся элементу НАПРЯМУЮ.
 * Обёртка вида onRender={() => rowRender(item.id)} создаёт новую функцию каждый рендер
 * и сама же ломает memo — это часть задачи.
 */
export type Item = { id: string; title: string }
export function Row({
	item,
	onRemove,
	onRender,
}: {
	item: Item
	onRemove: (id: string) => void
	onRender: (id: string) => void
}) {
	return <li>заглушка</li>
}
export function RowList({ initial, rowRender }: { initial: Item[]; rowRender: (id: string) => void }) {
	return <ul>заглушка</ul>
}
// #endregion

// #region RP-11 | Подписка на внешний стор | ★★★
/**
 * Подписаться на внешнее хранилище через useSyncExternalStore.
 * Это штатный способ связать React с любым сторонним стейт-менеджером,
 * он корректно работает с конкурентным рендерингом (в отличие от useEffect + setState).
 *
 * Вывести «Значение: N». Компонент перерисовывается только при изменении значения.
 */
export type ExternalStore = {
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => number
}
export function StoreValue({ store, onRender }: { store: ExternalStore } & Counted) {
	return <p>заглушка</p>
}
// #endregion

// #region RP-12 | Переход без блокировки | ★★★
/**
 * Две вкладки: «Быстрая» и «Тяжёлая». Переключение через useTransition,
 * пока идёт переход — показывать «Переключаю…».
 * Кнопки с role="tab" и aria-selected. Содержимое активной вкладки в <p>:
 * «Быстрое содержимое» или «Тяжёлое содержимое».
 */
export function TransitionTabs() {
	return <div>заглушка</div>
}
// #endregion

// #region RP-13 | Окно списка | ★★★
/**
 * Простая виртуализация: из всего списка отрисовать только элементы,
 * попадающие в окно [start, start + visible).
 * Кнопки «Вниз» и «Вверх» двигают окно на visible элементов, не выходя за границы.
 * Каждый видимый элемент — <li>. Плюс абзац «Показано N из M».
 */
export function WindowedList({ items, visible }: { items: string[]; visible: number }) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-14 | Батчинг обновлений | ★★★
/**
 * Обработчик меняет ДВА состояния подряд. Компонент должен перерисоваться
 * один раз, а не два — React 18+ батчит обновления везде, включая промисы и таймеры.
 *
 * Разметка: кнопка «Обновить оба» и текст «A: x, B: y».
 * Есть также кнопка «Обновить в промисе» — она делает то же самое внутри then.
 */
export function DoubleUpdate({ onRender }: Counted) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-15 | Производное состояние без эффекта | ★★☆
/**
 * Показать отфильтрованный список. Реализовать БЕЗ useEffect и БЕЗ второго useState:
 * фильтрация — производное значение.
 *
 * Разметка: инпут «Фильтр», список подходящих <li>, абзац «Найдено: N».
 * Тест проверит, что после ввода результат корректен уже в первом же рендере,
 * то есть не появляется через дополнительный проход.
 */
export function FilteredList({ items, onRender }: { items: string[] } & Counted) {
	return <div>заглушка</div>
}
// #endregion

// #region RP-16 | Сброс состояния через key | ★★★
/**
 * Форма редактирования пользователя с полем «Имя», инициализированным из props.
 * При смене пользователя поле должно сбрасываться на новое имя.
 *
 * Решение — НЕ useEffect, который синхронизирует состояние, а key={user.id} на форме:
 * React размонтирует старый экземпляр и создаст новый с чистым состоянием.
 *
 * UserEditor рендерит кнопку «Следующий» и саму форму.
 */
export function NameForm({ initialName }: { initialName: string }) {
	return <div>заглушка</div>
}
export function UserEditor({ users }: { users: User[] }) {
	return <div>заглушка</div>
}
// #endregion

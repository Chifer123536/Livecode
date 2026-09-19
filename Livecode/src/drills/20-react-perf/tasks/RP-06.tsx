import type { ReactNode } from 'react'

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

import type { ReactNode } from 'react'
import type { Counted } from './_pack'

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

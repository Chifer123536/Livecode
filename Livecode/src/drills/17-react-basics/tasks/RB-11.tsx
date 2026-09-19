import type { ReactNode } from 'react'

// #region RB-11 | Функциональный setState | ★★☆
/**
 * Счётчик с кнопками «+1» и «+3».
 * «+3» обязана увеличивать на три в ОДНОМ обработчике — три вызова сеттера подряд.
 * Если написать setCount(count + 1) трижды, получится +1. Это и есть задача.
 */
export function BatchCounter() {
	return <div>заглушка</div>
}
// #endregion

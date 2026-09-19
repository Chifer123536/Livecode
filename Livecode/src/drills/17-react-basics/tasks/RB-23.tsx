import type { ReactNode } from 'react'

// #region RB-23 | Интервал и очистка | ★★★
/**
 * Секундомер: текст «Прошло: N с», кнопки «Старт», «Пауза», «Сброс».
 * setInterval заводить в useEffect и ОБЯЗАТЕЛЬНО чистить в cleanup.
 * id интервала держать в ref, а не в state.
 */
export function Stopwatch() {
	return <div>заглушка</div>
}
// #endregion

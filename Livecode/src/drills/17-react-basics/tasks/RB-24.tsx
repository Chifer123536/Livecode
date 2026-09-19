import type { ReactNode } from 'react'

// #region RB-24 | Предыдущее значение | ★★★
/**
 * Счётчик, который показывает «Сейчас: N, было: M».
 * Предыдущее значение хранить в useRef и обновлять в useEffect — так оно отстаёт на рендер.
 * До первого изменения «было: —».
 */
export function PrevValue() {
	return <div>заглушка</div>
}
// #endregion

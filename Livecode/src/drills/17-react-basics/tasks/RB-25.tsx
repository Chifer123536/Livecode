import type { ReactNode } from 'react'

// #region RB-25 | Клик снаружи | ★★★
/**
 * Меню: кнопка «Меню» открывает <ul>. Клик ВНЕ меню закрывает его, клик внутри — нет.
 * Слушатель вешать на document в useEffect (событие mousedown) и снимать в cleanup.
 * Проверять попадание через ref обёртки: ref.current.contains(event.target).
 */
export function DropdownMenu({ items }: { items: string[] }) {
	return <div>заглушка</div>
}
// #endregion

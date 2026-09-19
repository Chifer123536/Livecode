import type { ReactNode } from 'react'

// #region RB-14 | Форма и preventDefault | ★★☆
/**
 * Форма поиска: инпут с подписью «Запрос» и кнопка «Найти» (type="submit").
 * Сабмит по Enter и по кнопке. При сабмите — вызвать onSearch с обрезанным значением.
 * Пустой запрос не отправлять. Обязателен e.preventDefault().
 */
export function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
	return <form>заглушка</form>
}
// #endregion

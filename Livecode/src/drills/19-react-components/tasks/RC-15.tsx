import type { ReactNode } from 'react'

// #region RC-15 | Тема через контекст | ★★★
/**
 * ThemeProvider хранит тему ('light' | 'dark') и кладёт её в контекст.
 * useTheme() возвращает { theme, toggle } и БРОСАЕТ понятную ошибку,
 * если вызван вне провайдера (сообщение должно содержать «ThemeProvider»).
 * ThemeButton — кнопка с текстом «Тема: light» / «Тема: dark», клик переключает.
 * Провайдер пишет тему в document.documentElement.dataset.theme.
 */
export function ThemeProvider({ children, initial = 'light' }: { children: ReactNode; initial?: 'light' | 'dark' }) {
	return <>{children}</>
}
export function useTheme(): { theme: 'light' | 'dark'; toggle: () => void } {
	return { theme: 'light', toggle: () => {} }
}
export function ThemeButton() {
	return <button>заглушка</button>
}
// #endregion

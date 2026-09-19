import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-01 | Контекст и хук доступа | ★★☆
/**
 * Провайдер темы и хук к нему:
 *  - ThemeProvider принимает initial ('light' по умолчанию) и children;
 *  - useTheme возвращает { theme, toggle };
 *  - вызов useTheme вне провайдера бросает Error с текстом
 *    'useTheme можно вызывать только внутри ThemeProvider'.
 *
 * Значение контекста обязательно мемоизировать: иначе каждый рендер провайдера
 * перерисует всех потребителей.
 */
export type Theme = 'light' | 'dark'

export function ThemeProvider({ initial, children }: { initial?: Theme; children: ReactNode }) {
	return <div data-initial={initial}>{children}</div>
}

export function useTheme(): { theme: Theme; toggle: () => void } {
	return { theme: 'light', toggle: () => undefined }
}
// #endregion

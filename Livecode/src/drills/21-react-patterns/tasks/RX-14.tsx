import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'
import { ThemeProvider } from './RX-01'

// #region RX-14 | Композиция провайдеров | ★★☆
/**
 * Лестница из шести провайдеров в корне приложения читается плохо.
 * Собрать их в один компонент: первый в списке — самый внешний.
 *
 *   const Providers = composeProviders(ThemeProvider, AuthProvider)
 */
export const composeProviders = (
	...providers: Array<ComponentType<{ children: ReactNode }>>
): ComponentType<{ children: ReactNode }> => {
	return function Composed({ children }: { children: ReactNode }) {
		return <>{children}</>
	}
}
// #endregion

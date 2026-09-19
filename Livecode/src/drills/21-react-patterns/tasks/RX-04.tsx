import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-04 | Компонент высшего порядка | ★★☆
/**
 * Обёртка, добавляющая пропс loading: при true рисуется <p>Загрузка…</p>,
 * иначе исходный компонент со своими пропсами (loading внутрь НЕ пробрасывается).
 * displayName обязателен: 'withLoading(ИмяКомпонента)' — иначе в девтулзах каша.
 */
export function withLoading<P extends object>(Component: ComponentType<P>): ComponentType<P & { loading: boolean }> {
	return function Wrapped(props: P & { loading: boolean }) {
		return <Component {...(props as P)} />
	}
}
// #endregion

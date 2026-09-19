import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-08 | Полиморфный компонент | ★★★
/**
 * Один компонент — любой тег: <Box as="a" href="/x">. По умолчанию div.
 * Пропсы должны типизироваться по выбранному тегу — это и есть сложность задачи.
 */
export type BoxProps<E extends ElementType> = { as?: E } & Omit<ComponentPropsWithoutRef<E>, 'as'>

export function Box<E extends ElementType = 'div'>(_props: BoxProps<E>) {
	return <div>заглушка</div>
}
// #endregion

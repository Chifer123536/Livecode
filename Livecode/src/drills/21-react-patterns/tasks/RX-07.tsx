import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-07 | Слоты | ★★☆
/**
 * Карточка, куда разметку передают пропсами-узлами:
 *  - title рисуется в <header>, footer — в <footer>;
 *  - пустой слот не создаёт пустой узел (нет title — нет <header>);
 *  - children всегда внутри <div class="card-body">.
 */
export function Card({ title, footer, children }: { title?: ReactNode; footer?: ReactNode; children: ReactNode }) {
	return <div>{children}</div>
}
// #endregion

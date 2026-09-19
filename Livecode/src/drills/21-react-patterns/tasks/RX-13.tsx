import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-13 | Оптимистичное обновление | ★★★
/**
 * Список задач, который добавляет элемент СРАЗУ, не дожидаясь сервера:
 *  - поле «Новая задача» и кнопка «Добавить»;
 *  - после отправки элемент виден мгновенно;
 *
 * Примеры:
 *  - onAdd отклонился → элемент убрать и показать <p role="alert">Не удалось добавить</p>;
 *  - пока запрос идёт, повторная отправка того же текста не нужна — кнопка отключена.
 */
export function OptimisticList({ items, onAdd }: { items: string[]; onAdd: (text: string) => Promise<void> }) {
	return (
		<ul>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}
// #endregion

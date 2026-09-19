import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-16 | Провайдер выбора | ★★☆
/**
 * Множественный выбор строк таблицы через контекст:
 *  - useSelection даёт { selected, isSelected, toggle, clear };
 *  - selected — массив в порядке добавления;
 *  - вне провайдера хук бросает Error с текстом
 *    'useSelection можно вызывать только внутри SelectionProvider'.
 */
export function SelectionProvider({ children }: { children: ReactNode }) {
	return <>{children}</>
}

export function useSelection(): {
	selected: number[]
	isSelected: (id: number) => boolean
	toggle: (id: number) => void
	clear: () => void
} {
	return { selected: [], isSelected: () => false, toggle: () => undefined, clear: () => undefined }
}
// #endregion

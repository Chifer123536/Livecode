import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-12 | Мастер по шагам | ★★★
/**
 * Пошаговая форма:
 *  - показывает текущий шаг и строку «Шаг N из M»;
 *  - «Назад» скрыта на первом шаге;
 *  - на последнем шаге вместо «Далее» — «Готово», она вызывает onDone;
 *  - состояние шага держать числом, а не тремя булевыми флагами.
 */
export function Wizard({ steps, onDone }: { steps: ReactNode[]; onDone: () => void }) {
	return <div>{steps[0]}</div>
}
// #endregion

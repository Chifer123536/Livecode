import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-15 | Состояние на два режима | ★★★
/**
 * Хук, из которого растёт RX-05: работает и как управляемое, и как неуправляемое состояние.
 *
 * Примеры:
 *  - передали value → возвращать его, а setState только звать onChange;
 *  - не передали → держать состояние внутри и всё равно звать onChange.
 */
export function useControllableState<T>(options: {
	value?: T
	defaultValue: T
	onChange?: (value: T) => void
}): [T, (value: T) => void] {
	return [options.value ?? options.defaultValue, () => undefined]
}
// #endregion

import { todo } from '../../../shared/kit'

// #region UTL-17 | Свой call и apply | ★★☆
/**
 * Вызвать функцию с заданным this. Реализовать БЕЗ использования call/apply/bind:
 * положить функцию во временное свойство объекта, вызвать и удалить.
 */
export const myCall = <R>(fn: (...args: unknown[]) => R, context: object, ...args: unknown[]): R => todo()
// #endregion

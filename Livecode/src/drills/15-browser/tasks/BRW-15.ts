import { todo } from '../../../shared/kit'

// #region BRW-15 | Тёмная тема | ★★☆
/**
 * Текущее предпочтение и подписка на смену. Подписываться надо через addEventListener
 * на MediaQueryList, возвращать функцию отписки.
 */
export const prefersDark = (): boolean => todo()
export const onColorSchemeChange = (handler: (dark: boolean) => void): (() => void) => todo()
// #endregion

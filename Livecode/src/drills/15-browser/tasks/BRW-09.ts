import { todo } from '../../../shared/kit'

// #region BRW-09 | Элемент виден | ★★☆
/**
 * Хотя бы частично попадает в окно. Границы окна берутся из window.innerWidth/innerHeight,
 * координаты элемента — из getBoundingClientRect.
 */
export const isInViewport = (element: HTMLElement): boolean => todo()
// #endregion

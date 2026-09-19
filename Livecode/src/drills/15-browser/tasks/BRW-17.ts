import { todo } from '../../../shared/kit'

// #region BRW-17 | Дождаться элемента | ★★★
/**
 * Элемент может появиться позже (сторонний виджет, ленивый блок).
 * Если он уже есть — вернуть сразу, иначе ждать через MutationObserver.
 * По таймауту — null, и наблюдатель обязан отключиться в любом случае.
 */
export const waitForElement = (selector: string, timeout: number): Promise<HTMLElement | null> => todo()
// #endregion

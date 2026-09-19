import type { DependencyList, EffectCallback, RefObject } from 'react'
import { todo } from '../../../shared/kit'

// #region RH-26 | useCopyToClipboard | ★★☆
/**
 * Возвращает [copied, copy]. copy кладёт текст в буфер через navigator.clipboard.writeText
 * и на resetMs миллисекунд поднимает флаг copied. Ошибку записи проглатывать, copied не поднимать.
 */
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => Promise<void>] {
	return todo()
}
// #endregion

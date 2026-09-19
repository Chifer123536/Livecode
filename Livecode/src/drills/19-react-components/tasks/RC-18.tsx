import type { ReactNode } from 'react'

// #region RC-18 | Кнопка «скопировать» | ★★☆
/**
 * Кнопка с текстом «Копировать». После успешного копирования на 2000 мс становится «Скопировано».
 *  - использует navigator.clipboard.writeText(text);
 *  - при ошибке записи текст кнопки не меняется, но появляется <p role="alert">Не удалось скопировать</p>;
 *  - повторный клик перезапускает отсчёт;
 *  - таймер чистится при размонтировании.
 */
export function CopyButton({ text }: { text: string }) {
	return <button>заглушка</button>
}
// #endregion

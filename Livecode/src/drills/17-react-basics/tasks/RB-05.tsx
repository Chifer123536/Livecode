import type { ReactNode } from 'react'

// #region RB-05 | Условный рендер | ★☆☆
/**
 * Кнопка «Показать» / «Скрыть» и абзац с текстом «Секрет».
 * Пока скрыто — абзаца НЕ ДОЛЖНО БЫТЬ В DOM (не display:none, а именно отсутствие узла).
 * Текст кнопки меняется вместе с состоянием.
 */
export function Toggle() {
	return <div>заглушка</div>
}
// #endregion

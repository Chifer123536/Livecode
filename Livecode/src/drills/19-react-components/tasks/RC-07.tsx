import type { ReactNode } from 'react'

// #region RC-07 | Рейтинг звёздами | ★★☆
/**
 * Пять кнопок-звёзд с aria-label «Оценка N».
 *  - клик выставляет оценку и зовёт onChange(N);
 *  - у выставленных звёзд data-active="true";
 *  - наведение подсвечивает звёзды до наведённой, уход мыши возвращает подсветку к оценке;
 *  - повторный клик по той же звезде сбрасывает оценку в 0.
 */
export function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	return <div>заглушка</div>
}
// #endregion

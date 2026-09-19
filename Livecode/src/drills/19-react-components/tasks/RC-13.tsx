import type { ReactNode } from 'react'

// #region RC-13 | Обратный отсчёт | ★★★
/**
 * Таймер от seconds до нуля.
 *  - текст «Осталось: MM:SS» (две цифры на каждую часть);
 *  - кнопки «Старт», «Пауза», «Сброс»;
 *  - на нуле останавливается сам и зовёт onEnd ровно один раз, показывает <p>Время вышло</p>;
 *  - интервал обязательно чистится в cleanup.
 */
export function Countdown({ seconds, onEnd }: { seconds: number; onEnd?: () => void }) {
	return <div>заглушка</div>
}
// #endregion

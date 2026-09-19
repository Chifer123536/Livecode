import { todo } from '../../../shared/kit'

// #region DAT-20 | Заполнить пропуски дат | ★★★
/**
 * График по дням не должен «съедать» дни без событий.
 * Даты в формате ГГГГ-ММ-ДД, диапазон включительный, отсутствующие дни получают 0.
 *
 *   fillDateGaps([{ date: '2026-03-01', value: 5 }, { date: '2026-03-03', value: 2 }], '2026-03-01', '2026-03-03')
 *     → [{ date: '2026-03-01', value: 5 }, { date: '2026-03-02', value: 0 }, { date: '2026-03-03', value: 2 }]
 */
export type Point = { date: string; value: number }
export const fillDateGaps = (points: Point[], from: string, to: string): Point[] => todo()
// #endregion

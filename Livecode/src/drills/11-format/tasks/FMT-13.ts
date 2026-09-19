import { todo } from '../../../shared/kit'

// #region FMT-13 | Человеческая метка дня | ★★☆
/**
 * Сравнение по КАЛЕНДАРНОМУ дню, а не по разнице в миллисекундах.
 *
 * Примеры:
 *   dayLabel(сегодня, now)  → 'сегодня'
 *   dayLabel(вчера, now)    → 'вчера'
 *   dayLabel(завтра, now)   → 'завтра'
 *   остальное               → '05.03.2026'
 */
export const dayLabel = (date: Date, now: Date): string => todo()
// #endregion

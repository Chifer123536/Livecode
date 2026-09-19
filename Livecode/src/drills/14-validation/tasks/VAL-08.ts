import { todo } from '../../../shared/kit'

// #region VAL-08 | Возраст | ★★☆
/**
 * Полных лет на дату now. Ловушка — день рождения ещё не наступил в этом году.
 *
 * Примеры:
 *   ageOn(new Date(2000, 5, 10), new Date(2026, 5, 9))  → 25
 *   ageOn(new Date(2000, 5, 10), new Date(2026, 5, 10)) → 26
 */
export const ageOn = (birthDate: Date, now: Date): number => todo()
export const isAdult = (birthDate: Date, now: Date): boolean => todo()
// #endregion

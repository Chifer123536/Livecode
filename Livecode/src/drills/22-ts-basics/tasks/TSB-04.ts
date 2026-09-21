import { todo } from '../../../shared/kit'

// #region TSB-04 | Union и сужение через typeof | ★☆☆
/**
 * Привести идентификатор к строке.
 * Число → '#42'. Строка → в верхний регистр.
 * Пока union не сужен, доступны только общие методы обоих типов.
 *
 * Примеры:
 *   formatId(42)     → '#42'
 *   formatId('ab12') → 'AB12'
 */
export const formatId = (id: string | number): string => todo()
// #endregion

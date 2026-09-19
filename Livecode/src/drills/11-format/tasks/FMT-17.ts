import { todo } from '../../../shared/kit'

// #region FMT-17 | Перечисление | ★★☆
/**
 * Последний элемент присоединяется союзом «и».
 *
 *   formatList(['а', 'б', 'в']) → 'а, б и в'
 *   formatList(['а', 'б'])      → 'а и б'
 *   formatList(['а'])           → 'а'
 *   formatList([])              → ''
 */
export const formatList = (items: string[]): string => todo()
// #endregion

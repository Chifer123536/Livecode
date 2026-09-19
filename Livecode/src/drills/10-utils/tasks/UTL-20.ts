import { todo } from '../../../shared/kit'

// #region UTL-20 | Глубокая заморозка | ★★☆
/**
 * Object.freeze поверхностный: вложенные объекты остаются изменяемыми.
 * Сделать рекурсивную заморозку, устойчивую к циклическим ссылкам.
 */
export const deepFreeze = <T>(value: T): T => todo()
// #endregion

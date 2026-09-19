import { todo } from '../../../shared/kit'

// #region UTL-09 | deepMerge | ★★★
/**
 * Слить два объекта вглубь: вложенные объекты объединяются, остальное перетирается
 * значением из source. Массивы НЕ склеиваются — побеждает source.
 * Ни один из входных объектов не мутируется.
 *
 * Практика: дефолтные настройки плюс пользовательские.
 */
export const deepMerge = <T extends object>(target: T, source: object): T => todo()
// #endregion

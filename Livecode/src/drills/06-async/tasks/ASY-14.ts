import { todo } from '../../../shared/kit'

// #region ASY-14 | Первый непустой ответ | ★★★
/**
 * Опросить источники ПО ОЧЕРЕДИ и вернуть первый непустой результат.
 * Источник, который упал, считается пустым и не должен ронять всё.
 * Все пустые → null.
 *
 * Реальный кейс: кэш → CDN → база.
 */
export const firstNonEmpty = <T>(sources: Array<() => Promise<T | null>>): Promise<T | null> => todo()
// #endregion

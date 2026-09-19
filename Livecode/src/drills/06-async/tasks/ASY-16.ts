import { todo } from '../../../shared/kit'

// #region ASY-16 | Кэш с временем жизни | ★★★
/**
 * Кэшировать результат по ключу на ttl миллисекунд.
 * Протухшая запись перезапрашивается. Упавший запрос не кэшируется.
 */
export const cached = <A extends string, R>(fn: (key: A) => Promise<R>, ttl: number): ((key: A) => Promise<R>) => todo()
// #endregion

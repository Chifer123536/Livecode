import { todo } from '../../../shared/kit'

// #region API-16 | Отдать из кэша и обновить | ★★★
/**
 * stale-while-revalidate: свежее значение отдаём сразу, протухшее — тоже сразу,
 * но параллельно запускаем обновление в фоне. Пока обновление идёт,
 * повторные вызовы новых запросов не плодят.
 */
export type SWR<T> = { read: (key: string) => Promise<T>; size: () => number }
export const staleWhileRevalidate = <T>(loader: (key: string) => Promise<T>, ttl: number): SWR<T> => todo()
// #endregion

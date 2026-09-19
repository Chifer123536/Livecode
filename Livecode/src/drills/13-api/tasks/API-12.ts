import { todo } from '../../../shared/kit'

// #region API-12 | Все страницы | ★★★
/**
 * Тянуть страницы, пока загрузчик отдаёт next, и склеить элементы.
 * limit — предохранитель от бесконечного цикла на кривом курсоре.
 */
export type Paged<T> = { items: T[]; next: string | null }
export const fetchAllPages = <T>(
	firstUrl: string,
	load: (url: string) => Promise<Paged<T>>,
	limit?: number
): Promise<T[]> => todo()
// #endregion

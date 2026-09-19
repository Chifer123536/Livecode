import { todo } from '../../../shared/kit'

// #region ASY-09 | Ограничение параллелизма | ★★★
/**
 * Выполнить fn для каждого элемента, но не более limit задач одновременно.
 * Порядок результатов — порядок входа.
 * Реальный кейс: 500 картинок и лимит API в 5 запросов.
 *
 *   mapLimit([1,2,3,4], 2, loadItem)
 */
export const mapLimit = <T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> =>
	todo()
// #endregion

import { todo } from '../../../shared/kit'

// #region DAT-24 | Комбинатор фильтров | ★★☆
/**
 * Собрать один предикат из списка. Пустой список — предикат, который пропускает всё.
 * Проверки должны выполняться лениво: первая ложная прекращает вычисление.
 *
 *   const predicate = combineFilters([p => p.inStock, p => p.price < 100])
 */
export const combineFilters = <T>(predicates: Array<(item: T) => boolean>): ((item: T) => boolean) => todo()
// #endregion

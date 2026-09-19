import { todo } from '../../shared/kit'

/**
 * ПРАВИЛА ПАКА
 * 1. Map вместо объекта берут ради трёх вещей: ключ любого типа, сохранённый порядок вставки,
 *    честный .size. Уметь назвать все три — обязательная программа.
 * 2. Ничего не мутируем на входе: возвращаем новый Map / новый Set.
 * 3. Итератор проходится ОДИН раз. Если функция должна отдать результат дважды —
 *    это ошибка проектирования, а не мелочь.
 * 4. Генератор ленивый: `take(fibonacci(), 5)` обязан работать с бесконечной последовательностью.
 */

// #region COL-01 | Подсчёт в Map | ★☆☆
/**
 * Сколько раз встретился каждый ключ.
 *
 *   countBy(['a', 'b', 'a'], x => x) → Map { 'a' => 2, 'b' => 1 }
 */
export const countBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, number> => todo()
// #endregion

// #region COL-02 | Группировка в Map | ★★☆
/**
 * Ключ → массив элементов. Порядок элементов внутри группы сохраняется.
 *
 *   groupToMap([1, 2, 3, 4], n => n % 2) → Map { 1 => [1, 3], 0 => [2, 4] }
 */
export const groupToMap = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T[]> => todo()
// #endregion

// #region COL-03 | Индекс по ключу | ★☆☆
/**
 * Ключ → сам элемент. При дубле ключа побеждает последний.
 * Так из списка с сервера делают справочник за O(1) вместо find по массиву.
 */
export const indexBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T> => todo()
// #endregion

// #region COL-04 | Map ↔ объект | ★★☆
/**
 * Два преобразования в обе стороны. В objectToMap брать только собственные ключи.
 *
 *   mapToObject(new Map([['a', 1]])) → { a: 1 }
 *   objectToMap({ a: 1 })            → Map { 'a' => 1 }
 */
export const mapToObject = <V>(map: Map<string, V>): Record<string, V> => todo()
export const objectToMap = <V>(source: Record<string, V>): Map<string, V> => todo()
// #endregion

// #region COL-05 | Инвертировать Map | ★★☆
/**
 * Значения становятся ключами. Одинаковые значения схлопываются — побеждает последнее.
 *
 *   invert(new Map([['a', 1], ['b', 2]])) → Map { 1 => 'a', 2 => 'b' }
 */
export const invert = <K, V>(map: Map<K, V>): Map<V, K> => todo()
// #endregion

// #region COL-06 | Слить с суммированием | ★★☆
/**
 * Несколько счётчиков в один. Ключи, которых не было, добавляются.
 *
 *   mergeSum(new Map([['a', 1]]), new Map([['a', 2], ['b', 5]]))
 *     → Map { 'a' => 3, 'b' => 5 }
 */
export const mergeSum = <K>(...maps: Map<K, number>[]): Map<K, number> => todo()
// #endregion

// #region COL-07 | Топ-N по значению | ★★☆
/**
 * Пары [ключ, значение] по убыванию значения. При равенстве — порядок вставки.
 *
 *   topN(new Map([['a', 1], ['b', 9]]), 1) → [['b', 9]]
 */
export const topN = <K>(map: Map<K, number>, n: number): Array<[K, number]> => todo()
// #endregion

// #region COL-08 | Объединение множеств | ★☆☆
/**
 *   union(new Set([1, 2]), new Set([2, 3])) → Set { 1, 2, 3 }
 * Исходные множества не трогать.
 */
export const union = <T>(a: Set<T>, b: Set<T>): Set<T> => todo()
// #endregion

// #region COL-09 | Пересечение и разность | ★★☆
/**
 *   intersection(new Set([1, 2, 3]), new Set([2, 3, 4])) → Set { 2, 3 }
 *   difference(new Set([1, 2, 3]), new Set([2]))         → Set { 1, 3 }
 *
 * Разность несимметрична: difference(a, b) — это «что есть в a и нет в b».
 */
export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => todo()
export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> => todo()
// #endregion

// #region COL-10 | Подмножество | ★★☆
/**
 * Все ли элементы a лежат в b. Пустое множество — подмножество любого.
 *
 *   isSubset(new Set([1]), new Set([1, 2])) → true
 */
export const isSubset = <T>(a: Set<T>, b: Set<T>): boolean => todo()
// #endregion

// #region COL-11 | Уникальные по ключу | ★★☆
/**
 * Первое вхождение побеждает, порядок сохраняется. Set здесь для O(1) проверки.
 *
 *   uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], u => u.id) → [{ id: 1 }, { id: 2 }]
 */
export const uniqueBy = <T, K>(items: T[], keyFn: (item: T) => K): T[] => todo()
// #endregion

// #region COL-12 | Кэш по объекту в WeakMap | ★★★
/**
 * Мемоизация функции одного объектного аргумента. Ключ — сам объект.
 * Именно WeakMap, а не Map: иначе кэш держит объект живым и это утечка.
 * Объяснить разницу вслух — половина задачи.
 */
export const memoizeByObject = <A extends object, R>(fn: (arg: A) => R): ((arg: A) => R) => todo()
// #endregion

// #region COL-13 | Генератор диапазона | ★★☆
/**
 * Ленивый аналог Array.from({ length }). Конец не включается, шаг может быть отрицательным.
 *
 *   [...range(0, 5)]      → [0, 1, 2, 3, 4]
 *   [...range(5, 0, -2)]  → [5, 3, 1]
 */
export function* range(start: number, end: number, step = 1): Generator<number> {
	todo()
}
// #endregion

// #region COL-14 | Взять N из итератора | ★★☆
/**
 * Первые n значений любой итерируемой сущности. Обязан работать с бесконечной:
 * никакого разворачивания в массив внутри.
 *
 *   take(fibonacci(), 5) → [0, 1, 1, 2, 3]
 */
export const take = <T>(iterable: Iterable<T>, n: number): T[] => todo()
// #endregion

// #region COL-15 | Ленивые map и filter | ★★★
/**
 * Генераторы, которые не материализуют промежуточный массив.
 * take(lazyMap(range(0, 1e9), n => n * 2), 3) обязан вернуться мгновенно.
 */
export function* lazyMap<T, R>(iterable: Iterable<T>, fn: (item: T) => R): Generator<R> {
	todo()
}
export function* lazyFilter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): Generator<T> {
	todo()
}
// #endregion

// #region COL-16 | zip двух итераторов | ★★☆
/**
 * Пары по позициям. Останавливается на КОРОТКОМ.
 *
 *   [...zip([1, 2, 3], 'ab')] → [[1, 'a'], [2, 'b']]
 */
export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
	todo()
}
// #endregion

// #region COL-17 | Свой итерируемый объект | ★★★
/**
 * Объект с методом [Symbol.iterator], который можно перебирать в for..of
 * и разворачивать спредом ПОВТОРНО — то есть каждый вызов отдаёт свежий итератор.
 *
 *   const r = makeRange(1, 4)
 *   [...r] → [1, 2, 3]
 *   [...r] → [1, 2, 3]   // второй раз тоже, это и проверяется
 */
export const makeRange = (start: number, end: number): Iterable<number> => todo()
// #endregion

// #region COL-18 | Бесконечная последовательность | ★★☆
/**
 * Фибоначчи без конца: 0, 1, 1, 2, 3, 5, ...
 * Ограничение ставит потребитель через take.
 */
export function* fibonacci(): Generator<number> {
	todo()
}
// #endregion

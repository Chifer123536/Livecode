import { todo } from '../../../shared/kit'

// #region ASY-26 | Порядок Event Loop | ★★★
/**
 * Не писать асинхронный код, а ПРЕДСКАЗАТЬ его порядок.
 * Вернуть массив строк ровно в том порядке, в котором они будут напечатаны:
 *
 *   console.log('1')
 *   setTimeout(() => console.log('2'), 0)
 *   Promise.resolve().then(() => console.log('3'))
 *   queueMicrotask(() => console.log('4'))
 *   console.log('5')
 *
 * Формат ответа — массив строк вида ['a', 'b', 'c'], только с нужными цифрами.
 * Это классический вопрос «что выведет», его дают почти всегда.
 * Подсказка к рассуждению: синхронный код → микрозадачи → макрозадачи.
 */
export const eventLoopOrder = (): string[] => todo()
// #endregion

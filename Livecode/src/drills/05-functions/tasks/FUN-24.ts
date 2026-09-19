import { todo } from '../../../shared/kit'

// #region FUN-24 | Что вернёт this | ★★★
/**
 * Не писать код, а ПРЕДСКАЗАТЬ. Дан объект:
 *
 *   const obj = {
 *     name: 'obj',
 *     regular() { return this?.name },
 *   }
 *
 * Вернуть массив из четырёх строк — что даст каждый вызов (strict mode, ES-модуль):
 *   1) obj.regular()
 *   2) const f = obj.regular; f()
 *   3) obj.regular.call({ name: 'other' })
 *   4) obj.regular.bind({ name: 'bound' })()
 *
 * Значение undefined записывай строкой 'undefined'.
 * Подсказка к рассуждению: приоритет правил — new, затем bind/call/apply,
 * затем вызов по точке, затем всё остальное.
 */
export const thisQuiz = (): string[] => todo()
// #endregion

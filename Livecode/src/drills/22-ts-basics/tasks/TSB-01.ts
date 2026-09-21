import { todo } from '../../../shared/kit'

// #region TSB-01 | Аннотации примитивов | ★☆☆
/**
 * Собрать строку из имени и возраста.
 * Тип каждого параметра и тип возврата указаны явно — это и есть базовая аннотация.
 *
 * Примеры:
 *   describeUser('Аня', 30) → 'Имя: Аня, возраст: 30'
 */
export const describeUser = (name: string, age: number): string => todo()
// #endregion

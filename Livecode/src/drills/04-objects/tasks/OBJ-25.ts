import { todo } from '../../../shared/kit'

// #region OBJ-25 | snake_case в camelCase рекурсивно | ★★★
/**
 * Привести все ключи объекта к camelCase, включая вложенные объекты и объекты внутри массивов.
 * Значения не трогать.
 *
 *   camelizeKeys({ user_name: 'Аня', address_info: { city_name: 'Тверь' } })
 *     → { userName: 'Аня', addressInfo: { cityName: 'Тверь' } }
 *
 * Практика: бэкенд отдаёт snake_case, фронтенд живёт в camelCase.
 */
export const camelizeKeys = (value: unknown): unknown => todo()
// #endregion

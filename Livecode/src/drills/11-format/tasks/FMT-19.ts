import { todo } from '../../../shared/kit'

// #region FMT-19 | Адрес из частей | ★★☆
/**
 * Собрать строку, пропуская пустые части.
 *
 *   formatAddress({ city: 'Москва', street: 'Ленина', house: '5', flat: '10' })
 *
 * Примеры:
 *     → 'Москва, ул. Ленина, д. 5, кв. 10'
 *   formatAddress({ city: 'Тверь', street: '', house: '', flat: '' }) → 'Тверь'
 */
export type Address = { city: string; street: string; house: string; flat: string }
export const formatAddress = (address: Address): string => todo()
// #endregion

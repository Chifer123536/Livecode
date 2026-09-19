import { todo } from '../../../shared/kit'

// #region BRW-07 | Делегирование событий | ★★★
/**
 * Один обработчик на контейнер вместо сотни на кнопки: находим ближайшего предка
 * цели, подходящего под селектор, и проверяем, что он внутри контейнера.
 * Это же решает проблему элементов, добавленных ПОСЛЕ подписки.
 * Обработчик получает событие и найденный элемент. Возвращает функцию отписки.
 */
export const delegate = (
	container: HTMLElement,
	selector: string,
	type: string,
	handler: (event: Event, target: HTMLElement) => void
): (() => void) => todo()
// #endregion

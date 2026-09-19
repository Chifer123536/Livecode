import { todo } from '../../../shared/kit'

// #region API-06 | Ошибка с кодом | ★★☆
/**
 * Свой класс ошибки: обычный Error теряет статус, и наверху непонятно,
 * показывать «не найдено» или «попробуйте позже».
 * Обязательно выставить name и сохранить прототип — иначе instanceof соврёт.
 */
export class ApiError extends Error {
	status = 0
	data: unknown = undefined

	constructor(status: number, message: string, data?: unknown) {
		super(message)
		todo()
	}
}
// #endregion

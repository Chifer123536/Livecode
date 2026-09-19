import type { ReactNode } from 'react'

// #region RC-05 | Модальное окно | ★★★
/**
 * <Modal open onClose title>{children}</Modal> через createPortal в document.body.
 *  - при open === false в DOM ничего нет;
 *  - контейнер: role="dialog", aria-modal="true", aria-labelledby на заголовок;
 *  - закрытие: Escape, клик по оверлею (data-testid="overlay"), кнопка с aria-label «Закрыть»;
 *  - клик по содержимому НЕ закрывает;
 *  - пока открыто, document.body.style.overflow === 'hidden', при закрытии возвращается прежнее;
 *  - слушатель клавиатуры снимается в cleanup.
 */
export function Modal({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean
	onClose: () => void
	title: string
	children?: ReactNode
}) {
	return null
}
// #endregion

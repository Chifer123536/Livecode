import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-18 | Очередь уведомлений | ★★★
/**
 * Провайдер тостов:
 *  - useToasts даёт { toasts, add, remove };
 *  - add возвращает id, тост сам исчезает через duration мс (по умолчанию 3000);
 *  - список рисуется как <ul>, каждый тост — <li role="status">;
 *  - при размонтировании таймеры обязаны сниматься, иначе setState на мёртвом компоненте.
 */
export type Toast = { id: number; text: string }

export function ToastProvider({ children, duration }: { children: ReactNode; duration?: number }) {
	return <div data-duration={duration}>{children}</div>
}

export function useToasts(): { toasts: Toast[]; add: (text: string) => number; remove: (id: number) => void } {
	return { toasts: [], add: () => 0, remove: () => undefined }
}
// #endregion

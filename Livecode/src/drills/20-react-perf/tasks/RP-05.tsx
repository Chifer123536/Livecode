import type { ReactNode } from 'react'
import type { Counted } from './_pack'

// #region RP-05 | Свой компаратор в memo | ★★★
/**
 * Ребёнок получает объект user и должен перерисовываться ТОЛЬКО при смене user.id,
 * даже если пришёл новый объект с тем же id.
 * Выводит «Пользователь: {name}».
 */
export type User = { id: number; name: string }
export function UserCard({ user, onRender }: { user: User } & Counted) {
	return <p>заглушка</p>
}
// #endregion

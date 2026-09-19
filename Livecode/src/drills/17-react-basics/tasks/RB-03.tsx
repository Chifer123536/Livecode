import type { ReactNode } from 'react'

// #region RB-03 | children и деструктуризация | ★☆☆
/**
 * Карточка пользователя: <h3> с именем, <p> с должностью, затем children.
 * children выводить как есть, без обёрток.
 *
 *   <UserCard name="Анна" role="фронтендер"><a href="#">профиль</a></UserCard>
 */
export function UserCard({ name, role, children }: { name: string; role: string; children?: ReactNode }) {
	return <article>заглушка</article>
}
// #endregion

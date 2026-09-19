import type { ReactNode } from 'react'
import type { User } from './RP-05'

// #region RP-16 | Сброс состояния через key | ★★★
/**
 * Форма редактирования пользователя с полем «Имя», инициализированным из props.
 * При смене пользователя поле должно сбрасываться на новое имя.
 *
 * Решение — НЕ useEffect, который синхронизирует состояние, а key={user.id} на форме:
 * React размонтирует старый экземпляр и создаст новый с чистым состоянием.
 *
 * UserEditor рендерит кнопку «Следующий» и саму форму.
 */
export function NameForm({ initialName }: { initialName: string }) {
	return <div>заглушка</div>
}
export function UserEditor({ users }: { users: User[] }) {
	return <div>заглушка</div>
}
// #endregion

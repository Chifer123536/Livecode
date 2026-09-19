'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createPostAction, type FormState } from './actions'

/**
 * useActionState(action, initialState) → [state, formAction, pending]
 *
 * Это замена старого useFormState: она же отдаёт флаг pending, отдельный хук не нужен.
 * formAction передаётся форме в атрибут action — React сам сериализует FormData,
 * вызовет серверную функцию и положит её результат в state.
 *
 * useFormStatus — про другое: он читает состояние БЛИЖАЙШЕЙ РОДИТЕЛЬСКОЙ формы
 * и работает только в компоненте, который лежит ВНУТРИ <form>. Поэтому кнопка
 * вынесена в отдельный компонент: в самой форме этот хук вернул бы pending: false.
 */

function SubmitButton() {
	const { pending } = useFormStatus()
	return (
		<button type="submit" disabled={pending}>
			{pending ? 'Сохраняю…' : 'Добавить'}
		</button>
	)
}

const initialState: FormState = { status: 'idle', message: '' }

export function PostForm() {
	const [state, formAction, pending] = useActionState(createPostAction, initialState)

	return (
		<form action={formAction} className="card">
			<div>
				<input name="title" placeholder="заголовок" aria-invalid={Boolean(state.fieldErrors?.title)} />
				{state.fieldErrors?.title && <p className="error">{state.fieldErrors.title}</p>}
			</div>

			<div style={{ marginTop: 8 }}>
				<input name="body" placeholder="текст" aria-invalid={Boolean(state.fieldErrors?.body)} />
				{state.fieldErrors?.body && <p className="error">{state.fieldErrors.body}</p>}
			</div>

			<div style={{ marginTop: 8 }}>
				<SubmitButton />
				{pending && <span style={{ marginLeft: 8, color: 'var(--muted)' }}>идёт отправка…</span>}
			</div>

			{state.status === 'ok' && <p className="ok">{state.message}</p>}
			{state.status === 'error' && <p className="error">{state.message}</p>}
		</form>
	)
}

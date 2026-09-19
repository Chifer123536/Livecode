'use server'

import { revalidatePath } from 'next/cache'
import { addPost } from '@/app/lib/db'

/**
 * Директива 'use server' на уровне ФАЙЛА помечает все его экспорты как Server Actions.
 * Именно так их подключают к клиентским компонентам: клиентский модуль импортирует
 * функцию, а сборщик подменяет её на вызов по сети.
 *
 * Определить Server Action ВНУТРИ клиентского компонента нельзя — только импортировать.
 */

export type FormState = {
	status: 'idle' | 'ok' | 'error'
	message: string
	fieldErrors?: { title?: string; body?: string }
}

/**
 * Сигнатура экшена для useActionState: первым аргументом идёт ПРЕДЫДУЩЕЕ состояние,
 * вторым — FormData. Возвращаемое значение становится новым состоянием.
 */
export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
	const title = String(formData.get('title') ?? '').trim()
	const body = String(formData.get('body') ?? '').trim()

	const fieldErrors: FormState['fieldErrors'] = {}
	if (title.length < 3) fieldErrors.title = 'Минимум 3 символа'
	if (body.length < 5) fieldErrors.body = 'Минимум 5 символов'

	if (Object.keys(fieldErrors).length > 0) {
		return { status: 'error', message: 'Проверь поля', fieldErrors }
	}

	// Небольшая задержка, чтобы было видно pending в интерфейсе.
	await new Promise(resolve => setTimeout(resolve, 600))

	await addPost(title, body)
	revalidatePath('/09-action-state')

	return { status: 'ok', message: `Добавлено: ${title}` }
}

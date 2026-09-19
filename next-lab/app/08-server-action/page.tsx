import { revalidatePath } from 'next/cache'
import { addPost, getPosts } from '@/app/lib/db'

/**
 * ДЕМО 08 — SERVER ACTION БЕЗ КЛИЕНТСКОГО JS
 *
 * Функция с директивой 'use server' внутри тела — это Server Action.
 * Она передаётся форме через атрибут `action`, и React сам сериализует данные,
 * шлёт POST на сервер и обновляет дерево.
 *
 * Чего здесь НЕТ и не нужно: fetch, useState, onSubmit, preventDefault, JSON.stringify,
 * ручного обновления списка после ответа.
 *
 * ПРОГРЕССИВНОЕ УЛУЧШЕНИЕ: это обычная HTML-форма. Пока JavaScript не загрузился
 * или выключен, она всё равно отправится — браузер сделает нативный POST.
 * Именно это Vercel называет главным преимуществом Server Actions.
 *
 * БЕЗОПАСНОСТЬ: Server Action доступен как POST-эндпоинт напрямую, не только из вашей формы.
 * Проверку прав надо делать ВНУТРИ каждой функции, а не только прятать кнопку в UI.
 *
 * revalidatePath сбрасывает кэш маршрута, чтобы список перерисовался с новыми данными.
 */

export const dynamic = 'force-dynamic'

export default async function ServerActionDemo() {
	const posts = await getPosts()

	async function createPost(formData: FormData) {
		'use server'

		const title = String(formData.get('title') ?? '').trim()
		const body = String(formData.get('body') ?? '').trim()

		// Здесь на проде стоит проверка сессии и прав пользователя.
		if (!title) return

		await addPost(title, body || '(без текста)')
		revalidatePath('/08-server-action')
	}

	return (
		<>
			<h1>Server Action</h1>
			<p className="lead">Форма без единой строчки клиентского JavaScript.</p>

			<form action={createPost} className="card">
				<div>
					<input name="title" placeholder="заголовок" />
				</div>
				<div style={{ marginTop: 8 }}>
					<input name="body" placeholder="текст" />
				</div>
				<div style={{ marginTop: 8 }}>
					<button type="submit">Добавить</button>
				</div>
			</form>

			<div className="note">
				Открой вкладку «Сеть» в devtools и отправь форму: увидишь один POST на текущий адрес,
				в ответе — новый кусок дерева. Никаких <code>/api/posts</code> и ручного fetch.
			</div>

			<h2>Посты ({posts.length})</h2>
			{posts.map(post => (
				<div className="card" key={post.id}>
					<strong>{post.title}</strong>
					<div style={{ color: 'var(--muted)' }}>{post.body}</div>
				</div>
			))}
		</>
	)
}

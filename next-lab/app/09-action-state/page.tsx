import { getPosts } from '@/app/lib/db'
import { PostForm } from './form'

/**
 * ДЕМО 09 — USEACTIONSTATE
 *
 * Разница с демо 08: там форма просто отправлялась, и ответить пользователю было нечем.
 * Здесь экшен возвращает объект состояния — ошибки валидации, сообщение об успехе, —
 * а хук кладёт его в UI. Плюс появляется флаг pending.
 *
 * Схема, которую надо уметь проговорить:
 *   серверная страница (данные)
 *     → клиентская форма ('use client', useActionState)
 *       → Server Action ('use server', валидация + запись + revalidatePath)
 *         → новое состояние прилетает обратно в форму
 *
 * Валидация дублируется намеренно: на клиенте — для скорости отклика,
 * на сервере — потому что клиенту доверять нельзя, экшен дёргается и напрямую.
 */

export const dynamic = 'force-dynamic'

export default async function ActionStateDemo() {
	const posts = await getPosts()

	return (
		<>
			<h1>useActionState</h1>
			<p className="lead">Форма с состоянием отправки и ошибками валидации с сервера.</p>

			<PostForm />

			<div className="note">
				Попробуй отправить пустую форму — ошибки придут с сервера. Введи корректные значения —
				увидишь «Сохраняю…», а потом новый пост в списке без ручного обновления страницы.
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

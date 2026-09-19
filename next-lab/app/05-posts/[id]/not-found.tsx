import Link from 'next/link'

/**
 * `not-found.tsx` рендерится, когда в сегменте вызвали `notFound()`
 * или пользователь пришёл по несуществующему адресу.
 * Ответ отдаётся с HTTP-статусом 404 — это важно для поисковиков.
 */
export default function NotFound() {
	return (
		<>
			<h1>Пост не найден</h1>
			<p className="lead">Такого id в хранилище нет.</p>
			<Link href="/05-posts">← ко всем постам</Link>
		</>
	)
}

import Link from 'next/link'
import { getPosts } from '@/app/lib/db'

/**
 * ДЕМО 05 (список) — точка входа в динамический маршрут.
 * Каждая ссылка ведёт в `app/05-posts/[id]/page.tsx`.
 *
 * <Link> вместо <a>: Next перехватывает клик, подгружает только нужный кусок RSC-дерева
 * и не перезагружает страницу. Плюс префетч при появлении ссылки во вьюпорте.
 */
export default async function PostsPage() {
	const posts = await getPosts()

	return (
		<>
			<h1>Посты</h1>
			<p className="lead">Список ведёт в динамический сегмент [id].</p>

			{posts.map(post => (
				<div className="card" key={post.id}>
					<Link href={`/05-posts/${post.id}`}>{post.title}</Link>
				</div>
			))}

			<div className="note">
				Проверь несуществующий адрес: <Link href="/05-posts/999">/05-posts/999</Link> — сработает
				<code>notFound()</code> и покажется <code>not-found.tsx</code>.
			</div>
		</>
	)
}

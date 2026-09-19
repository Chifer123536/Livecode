import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPost, getPosts } from '@/app/lib/db'

/**
 * ДЕМО 05 — ДИНАМИЧЕСКИЙ МАРШРУТ [id]
 *
 * ГЛАВНОЕ ИЗМЕНЕНИЕ, КОТОРОЕ СПРАШИВАЮТ: начиная с Next 15, `params` и `searchParams` —
 * это ПРОМИСЫ. Их надо await (или читать через React `use` в клиентском компоненте).
 * В Next 14 и раньше это были обычные объекты. Если на собесе скажешь «params — объект»,
 * это сразу выдаст, что ты учил по старым статьям.
 *
 * Виды динамических сегментов:
 *   [id]        — один сегмент:            /posts/1        → { id: '1' }
 *   [...slug]   — catch-all:               /a/b/c          → { slug: ['a','b','c'] }
 *   [[...slug]] — необязательный catch-all: /  и /a/b       → slug может отсутствовать
 *
 * notFound() бросает специальное исключение, которое Next перехватывает и рендерит
 * ближайший `not-found.tsx` с кодом ответа 404. Код после вызова не выполняется.
 */

type Props = { params: Promise<{ id: string }> }

/**
 * generateStaticParams заранее сообщает Next, какие значения [id] существуют,
 * чтобы собрать их статически на этапе билда (SSG). Остальные адреса
 * отрендерятся по запросу.
 */
export async function generateStaticParams() {
	const posts = await getPosts()
	return posts.map(post => ({ id: post.id }))
}

/** generateMetadata видит те же params и тоже должен их await. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params
	const post = await getPost(id)
	return { title: post ? post.title : 'Пост не найден' }
}

export default async function PostPage({ params }: Props) {
	const { id } = await params
	const post = await getPost(id, 200)

	if (!post) notFound()

	return (
		<>
			<h1>{post.title}</h1>
			<p className="lead">id из адреса: {id}</p>
			<div className="card">{post.body}</div>
			<p>
				<Link href="/05-posts">← ко всем постам</Link>
			</p>

			<h2>Что запомнить</h2>
			<ul>
				<li>
					<code>params</code> — это <code>Promise</code>, его обязательно <code>await</code>.
				</li>
				<li>
					<code>notFound()</code> отдаёт 404 и рендерит <code>not-found.tsx</code>.
				</li>
				<li>
					<code>generateStaticParams</code> — предсборка известных адресов.
				</li>
			</ul>
		</>
	)
}

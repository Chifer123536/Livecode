/**
 * Фейковое «хранилище» вместо настоящей базы.
 * Живёт в памяти процесса: при перезапуске dev-сервера данные сбрасываются,
 * и это нормально — учимся мы не базе, а маршрутизации и рендерингу.
 */

export type Post = { id: string; title: string; body: string; createdAt: number }

const posts: Post[] = [
	{ id: '1', title: 'Серверные компоненты', body: 'Рендерятся на сервере, в бандл не попадают.', createdAt: 1 },
	{ id: '2', title: 'Клиентские компоненты', body: 'Нужны для состояния, эффектов и обработчиков.', createdAt: 2 },
	{ id: '3', title: 'Кэширование', body: 'В Next 16 всё кэшируется только явно.', createdAt: 3 },
]

/** Искусственная задержка — чтобы было видно loading.tsx и стриминг. */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getPosts(delay = 0): Promise<Post[]> {
	if (delay) await wait(delay)
	return [...posts].sort((a, b) => b.createdAt - a.createdAt)
}

export async function getPost(id: string, delay = 0): Promise<Post | null> {
	if (delay) await wait(delay)
	return posts.find(post => post.id === id) ?? null
}

export async function addPost(title: string, body: string): Promise<Post> {
	const post: Post = {
		id: String(Date.now()),
		title,
		body,
		createdAt: Date.now(),
	}
	posts.unshift(post)
	return post
}

export async function getFlaky(): Promise<string> {
	throw new Error('Сервис отчётов недоступен')
}

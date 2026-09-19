import { NextResponse } from 'next/server'
import { addPost, getPosts } from '@/app/lib/db'

/**
 * ROUTE HANDLER — файл `route.ts` вместо `page.tsx`.
 * В одном сегменте может быть либо page, либо route, но не оба сразу.
 *
 * Экспортируются функции по именам HTTP-методов: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
 * Работают со стандартными Web API Request и Response — теми же, что в браузере
 * и в Cloudflare Workers, а не с req/res из Express.
 *
 * Когда Route Handler нужен, а когда нет:
 *  - НЕ нужен, чтобы получить данные для своей же страницы — серверный компонент
 *    сходит в базу напрямую, лишний сетевой хоп не нужен;
 *  - НЕ нужен для форм — для них есть Server Actions;
 *  - НУЖЕН для вебхуков, публичного API, OAuth-колбэков, отдачи файлов,
 *    и вообще всего, что дёргает кто-то снаружи вашего приложения.
 */

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const query = searchParams.get('q')?.toLowerCase() ?? ''

	const posts = await getPosts()
	const filtered = query ? posts.filter(post => post.title.toLowerCase().includes(query)) : posts

	return NextResponse.json({ count: filtered.length, items: filtered })
}

export async function POST(request: Request) {
	let payload: unknown
	try {
		payload = await request.json()
	} catch {
		return NextResponse.json({ error: 'Ожидался JSON' }, { status: 400 })
	}

	const body = payload as { title?: unknown; body?: unknown }
	if (typeof body.title !== 'string' || body.title.trim().length < 3) {
		return NextResponse.json({ error: 'title: минимум 3 символа' }, { status: 422 })
	}

	const post = await addPost(body.title.trim(), typeof body.body === 'string' ? body.body : '')
	return NextResponse.json(post, { status: 201 })
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

/**
 * Навигационные хуки живут в `next/navigation` (не в `next/router` — то старый Pages Router)
 * и работают ТОЛЬКО в клиентских компонентах.
 *
 *   usePathname()     — текущий путь без строки запроса
 *   useSearchParams() — экземпляр URLSearchParams, только на чтение
 *   useRouter()       — push, replace, back, forward, refresh
 *
 * Важно: useSearchParams делает компонент динамическим. Если он внутри статической
 * страницы, Next потребует обернуть его в <Suspense>, иначе билд упадёт с ошибкой
 * про «missing suspense boundary with useSearchParams».
 *
 * push добавляет запись в историю, replace — заменяет текущую.
 * Для фильтров обычно replace: иначе кнопка «назад» будет отматывать каждую букву.
 */
export function NavDemo() {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	const tab = searchParams.get('tab') ?? 'first'

	const setTab = (next: string) => {
		const params = new URLSearchParams(searchParams)
		params.set('tab', next)
		// startTransition оставляет интерфейс отзывчивым, пока Next догружает данные.
		startTransition(() => router.replace(`${pathname}?${params}`))
	}

	return (
		<>
			<div className="card">
				<div>
					<code>usePathname()</code> → {pathname}
				</div>
				<div>
					<code>useSearchParams().toString()</code> → {searchParams.toString() || '(пусто)'}
				</div>
			</div>

			<div className="card">
				<button onClick={() => setTab('first')} aria-pressed={tab === 'first'}>
					Вкладка 1
				</button>{' '}
				<button onClick={() => setTab('second')} aria-pressed={tab === 'second'}>
					Вкладка 2
				</button>{' '}
				{pending && <span style={{ color: 'var(--muted)' }}>переключаю…</span>}
				<p>Активная вкладка: {tab}</p>
			</div>

			<div className="card">
				<button onClick={() => router.back()}>router.back()</button>{' '}
				<button onClick={() => router.refresh()}>router.refresh()</button>{' '}
				<Link href="/10-navigation?tab=second">обычный Link</Link>
			</div>
		</>
	)
}

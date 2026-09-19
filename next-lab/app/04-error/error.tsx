'use client'

import { useEffect } from 'react'

/**
 * `error.tsx` — граница ошибок сегмента. Требования соглашения:
 *  - файл ОБЯЗАН быть клиентским компонентом ('use client'), потому что
 *    ему нужна интерактивность (кнопка повтора) и React error boundary работает на клиенте;
 *  - получает пропсы `error` и `reset`;
 *  - ловит ошибки страницы и всего, что ниже по дереву, но НЕ ошибки своего layout —
 *    для них нужен error.tsx уровнем выше;
 *  - ошибки корневого layout ловит только `global-error.tsx`.
 *
 * В проде сообщение ошибки скрыто: наружу уходит `digest`, а текст остаётся в логах сервера.
 * Это защита от утечки деталей реализации.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Здесь на проде живёт отправка в Sentry или другой сборщик ошибок.
		console.error('Поймано границей ошибок:', error)
	}, [error])

	return (
		<>
			<h1>Что-то сломалось</h1>
			<p className="lead error">{error.message}</p>
			{error.digest && (
				<p style={{ color: 'var(--muted)', fontSize: 13 }}>
					digest: <code>{error.digest}</code>
				</p>
			)}
			<button onClick={reset}>Повторить</button>
			<div className="note">
				<code>reset()</code> перемонтирует сегмент и пробует отрисовать его заново.
				Если причина ошибки не исчезла, граница сработает снова.
			</div>
		</>
	)
}

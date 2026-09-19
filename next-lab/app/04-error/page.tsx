import { getFlaky } from '@/app/lib/db'

/**
 * ДЕМО 04 — ГРАНИЦА ОШИБОК
 *
 * Эта страница всегда бросает исключение. Ловит его `error.tsx` из того же сегмента.
 * Пользователь видит не белый экран и не падение всего приложения, а только
 * сломанный кусок — остальной layout (боковое меню) продолжает работать.
 *
 * Иерархия перехвата: page → error.tsx сегмента → error.tsx родителя → global-error.tsx.
 */
// Страница всегда падает — запрещаем пререндер на этапе сборки.
export const dynamic = 'force-dynamic'

export default async function ErrorDemo() {
	const report = await getFlaky()
	return <p>{report}</p>
}

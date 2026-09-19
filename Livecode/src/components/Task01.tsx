// ЛАЙВКОД #1 — debounce + React
//
// 1) Напиши функцию debounce(fn, delay):
//    возвращает новую функцию; при частых вызовах fn срабатывает
//    один раз — через delay мс после ПОСЛЕДНЕГО вызова.
//
// 2) Сделай кастомный хук useDebounce(value, delay):
//    возвращает value, но обновляется только через delay мс тишины.
//
// 3) Компонент Search: инпут, при вводе логирует "запрос: <text>"
//    НЕ на каждый символ, а через 300мс после остановки печати.

export function debounce(fn: (...args: any[]) => void, delay: number) {}

// export function useDebounce<T>(value: T, delay: number): T {
//   ...
// }

export function Search() {
	//   ...
}

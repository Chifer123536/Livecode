/**
 * Инструменты для проверок на уровне типов.
 *
 * Equal<A, B> — строгое сравнение типов. Трюк с двумя обобщёнными функциями
 * опирается на то, что компилятор сравнивает отложенные условные типы по структуре,
 * поэтому он различает даже `any` и `unknown`, в отличие от наивного
 * `A extends B ? B extends A ? true : false : false`.
 *
 * Expect<T> принимает только `true`. Если сравнение дало `false`,
 * строка подсвечивается ошибкой прямо в редакторе и валит `yarn typecheck`.
 */
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

export type Expect<T extends true> = T

export type NotEqual<A, B> = Equal<A, B> extends true ? false : true

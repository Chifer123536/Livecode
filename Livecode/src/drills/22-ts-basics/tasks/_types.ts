/** Общие типы-образцы для задач на utility types. */

export type Post = { id: number; title: string; body: string }

export type PostWithTags = { id: number; title: string; tags?: string[] }

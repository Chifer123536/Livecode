import { todo } from '../../../shared/kit'
import type { TreeNode } from './_pack'

// #region REC-13 | Фильтр дерева | ★★★
/**
 * Оставить узлы, подходящие под предикат, И их предков — иначе ветка оборвётся.
 * Узел остаётся, если подходит сам ИЛИ после фильтрации у него остались дети.
 * Возвращается НОВОЕ дерево, исходное не трогаем.
 */
export const filterTree = (nodes: TreeNode[], predicate: (node: TreeNode) => boolean): TreeNode[] => todo()
// #endregion

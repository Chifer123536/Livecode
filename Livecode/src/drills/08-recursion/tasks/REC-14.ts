import { todo } from '../../../shared/kit'
import type { TreeNode } from './_pack'

// #region REC-14 | Преобразовать каждый узел | ★★☆
/**
 * map для дерева: применить fn к каждому узлу, сохранив структуру.
 * Детей обрабатывать после родителя, поле children не терять.
 */
export const mapTree = (nodes: TreeNode[], fn: (node: TreeNode) => TreeNode): TreeNode[] => todo()
// #endregion

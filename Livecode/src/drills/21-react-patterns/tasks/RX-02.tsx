import { Component } from 'react'
import type { ComponentPropsWithoutRef, ComponentType, ElementType, ReactNode, Ref } from 'react'

// #region RX-02 | Составной компонент | ★★★
/**
 * Вкладки, где состояние живёт в родителе, а разметку собирает пользователь:
 *
 *   <Tabs defaultValue="a">
 *     <Tabs.List><Tabs.Tab value="a">А</Tabs.Tab><Tabs.Tab value="b">Б</Tabs.Tab></Tabs.List>
 *     <Tabs.Panel value="a">Панель А</Tabs.Panel>
 *     <Tabs.Panel value="b">Панель Б</Tabs.Panel>
 *   </Tabs>
 *
 * Требования: List — role="tablist", Tab — role="tab" и aria-selected,
 * активная панель одна, неактивные не рендерятся вовсе.
 */
export const Tabs = Object.assign(
	function TabsRoot({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
		return <div data-default={defaultValue}>{children}</div>
	},
	{
		List: function TabsList({ children }: { children: ReactNode }) {
			return <div>{children}</div>
		},
		Tab: function Tab({ value, children }: { value: string; children: ReactNode }) {
			return <button data-value={value}>{children}</button>
		},
		Panel: function TabPanel({ value, children }: { value: string; children: ReactNode }) {
			return <div data-value={value}>{children}</div>
		},
	}
)
// #endregion

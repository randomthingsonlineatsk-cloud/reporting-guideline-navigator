import { createContext, useContext } from 'react'
export type View = 'workspace' | 'abstract' | 'authorship' | 'disclosures' | 'submission' | 'export'
export type Page = 'home' | 'picker' | 'ethics' | 'learn'
export interface Nav { view: View; go: (v: View) => void; page: Page; setPage: (p: Page, arg?: string) => void; arg?: string }
export const NavCtx = createContext<Nav>({ view: 'workspace', go: () => {}, page: 'home', setPage: () => {} })
export const useNav = () => useContext(NavCtx)

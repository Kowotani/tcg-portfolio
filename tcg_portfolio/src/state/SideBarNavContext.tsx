import { useState, createContext, ReactNode } from 'react'
import { SideBarNav } from '../utils'

// create context
export const SideBarNavContext = createContext({});

// create Provider
export const SideBarNavProvider = (children: ReactNode) => {

    const [nav, setSideBarNav] = useState(SideBarNav.HOME)

    const value = {nav, setSideBarNav}

    return (
        <SideBarNavContext.Provider value={value}>
            {children}
        </SideBarNavContext.Provider>
    )
}
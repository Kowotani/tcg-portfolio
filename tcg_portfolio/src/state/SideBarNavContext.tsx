import { createContext, PropsWithChildren, useState } from 'react'
import { ISideBarNavContext, SideBarNav } from '../utils'

// create context
export const SideBarNavContext = createContext<ISideBarNavContext | null>(null);

// create Provider
export const SideBarNavProvider = (props: PropsWithChildren) => {

  const [sideBarNav, setSideBarNav] = useState(SideBarNav.HOME)

  const value = {sideBarNav, setSideBarNav}

  return (
    <SideBarNavContext.Provider value={value}>
      {props.children}
    </SideBarNavContext.Provider>
  )
}
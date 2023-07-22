import { createContext, PropsWithChildren, useState } from 'react'
import { ISideBarNavContext, SideBarNav } from '../utils'

// create context
export const SideBarNavContext = createContext<ISideBarNavContext>({
  sideBarNav: {
    order: SideBarNav.HOME.order,
    name: SideBarNav.HOME.name,
    authorizedRoles: SideBarNav.HOME.authorizedRoles,
  },
  setSideBarNav: () => {}     // dummy placeholder
});

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
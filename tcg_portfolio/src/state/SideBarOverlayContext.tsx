import { createContext, PropsWithChildren, useState } from 'react'
import { ISideBarOverlay, ISideBarOverlayContext } from '../utils/SideBar'

// create context
export const SideBarOverlayContext = createContext<ISideBarOverlayContext | null>(null)

// create Provider
export const SideBarOverlayProvider = (props: PropsWithChildren) => {

  const [sideBarOverlay, setSideBarOverlay] = useState({
    isExpanded: false,
    isOpen: false
  } as ISideBarOverlay)

  const value = {sideBarOverlay, setSideBarOverlay}

  return (
    <SideBarOverlayContext.Provider value={value}>
      {props.children}
    </SideBarOverlayContext.Provider>
  )
}
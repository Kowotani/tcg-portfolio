import { createContext, PropsWithChildren, useState } from 'react'
import { IMobileMode, IMobileModeContext } from '../utils/mobile'

// create context
export const MobileModeContext = createContext<IMobileModeContext | null>(null)

// create Provider
export const MobileModeProvider = (props: PropsWithChildren) => {

  const [mobileMode, setMobileMode] = useState({
    isActive: false
  } as IMobileMode)

  const value = {mobileMode, setMobileMode}

  return (
    <MobileModeContext.Provider value={value}>
      {props.children}
    </MobileModeContext.Provider>
  )
}
import { useEffect, useContext } from 'react'
import {
  Flex,
  IconButton,
  Spacer
} from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { useWindowDimensions } from '../hooks/WindowDimensions'
import { FaUser } from 'react-icons/fa'
import { SiWasmer } from 'react-icons/si'
import { MobileModeContext } from '../state/MobileModeContext'
import { IMobileMode, IMobileModeContext } from '../utils/mobile'
import { ISideBarOverlayContext } from '../utils/SideBar'
import { SideBarOverlayContext } from '../state/SideBarOverlayContext'



// =========
// constants
// =========

const MOBILE_WIDTH_BREAKPOINT = 800


// =============
// sub component
// =============

const UserPanel = () => {

  return (
    <Flex direction='row' align='center'>
      {/* TODO: implement functionality */}
      <IconButton 
        aria-label='User account' 
        icon={<FaUser />} 
        fontSize={20}
        size='md'
        variant='ghost'
      />
      <ColorModeSwitcher />
    </Flex>
  )
}


// ==============
// main component
// ==============

export const Header = () => {


  // =====
  // state
  // =====

  const { width, height } = useWindowDimensions()
  const { mobileMode, setMobileMode } = 
    useContext(MobileModeContext) as IMobileModeContext
  const { sideBarOverlay, setSideBarOverlay } = 
    useContext(SideBarOverlayContext) as ISideBarOverlayContext 


  // =========
  // functions
  // =========

  /*
    DESC
      Handles clicks on the logo
  */
  function onLogoClick(): void {
    if (mobileMode.isActive) {
      console.log('toggling isOpen')
      setSideBarOverlay({
        ...sideBarOverlay,
        isOpen: !sideBarOverlay.isOpen
      })
    }
  }


  // =====
  // hooks
  // =====

  useEffect(() => {
    setMobileMode({
      ...mobileMode,
      isActive: width < height && width <= MOBILE_WIDTH_BREAKPOINT
    } as IMobileMode)
  }, [width, height])

  return (
    <Flex 
      align='center'  
      height={14} 
      justify='flex-end' 
      borderBottom='1px solid'
    >
      {/* TODO: Improve this UI */}
      <IconButton 
        aria-label='Header menu'        
        icon={<SiWasmer />} 
        fontSize={40}
        margin={2}
        onClick={() => onLogoClick()}
        variant='ghost'
      />
      <Spacer />
      <UserPanel />
    </Flex>
    )
}
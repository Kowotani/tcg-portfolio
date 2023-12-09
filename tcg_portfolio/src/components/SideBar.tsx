import { 
  ReactNode, PropsWithChildren, useContext
} from 'react'
import {  
  Box,  
  Flex,
  Icon,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode
} from '@chakra-ui/react'
import { AddProductForm } from './AddProductForm'
import { PortfolioPanelManager } from './PortfolioPanelManager'
import { FaBox, FaFolderOpen, FaHouse, FaForward } from 'react-icons/fa6'
import { MobileModeContext } from '../state/MobileModeContext'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { SideBarOverlayContext } from '../state/SideBarOverlayContext'
import { IMobileModeContext } from '../utils/mobile'
import { 
  ISideBarNav, ISideBarNavContext, ISideBarOverlayContext, SideBarNav 
} from '../utils/SideBar'


// =========
// constants
// =========

const TRANSITION_DURATION = '0.3s'


// ==============
// sub components
// ==============

// -- Nav Button

type TNavButtonProps = {
  icon: ReactNode,
  isActive: boolean,
  sideBarNav: ISideBarNav,

}
const NavButton = (props: PropsWithChildren<TNavButtonProps>) => {

  
  // =========
  // constants
  // =========

  // TODO: Change width to be unitless
  const COLLAPSED_WIDTH = '24px'
  const EXPANDED_WIDTH = '96px'
  
  
  // =====
  // state
  // =====

  const { colorMode } = useColorMode()
  const { mobileMode } = useContext(MobileModeContext) as IMobileModeContext
  const { setSideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { sideBarOverlay } = 
    useContext(SideBarOverlayContext) as ISideBarOverlayContext


  // overlay variables
  const backgroundColor = colorMode === 'light' ? 'blue.200' : 'blue.300'
  const isExpanded = sideBarOverlay.isExpanded || mobileMode.isActive


  // =========
  // functions
  // =========

  /*
    DESC
      Handles nav clicks
  */
  function handleOnClick(): void {
    setSideBarNav(props.sideBarNav)
  }


  // ==============
  // main component
  // ==============

  return (
    <Box
      bg={props.isActive ? backgroundColor : undefined}
      borderRadius={12}
      justifyContent='flex-start'
      m={2}
      onClick={handleOnClick}
      overflow='hidden'
      p={2}
      
    >
      <Flex 
        align='center' 
        justify='flex-start'
        width={isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
        transition={`width ${TRANSITION_DURATION}`}
      > 
        {props.icon}
        {isExpanded && (
          <>            
            <Text paddingLeft={2}>
              {props.sideBarNav.name}
            </Text>
          </>
        )}
      </Flex>
    </Box>
  )
}


// -- SideBar Overlay
const SideBarOverlay = () => {


  // =====
  // state
  // =====

  const { colorMode } = useColorMode()
  const { mobileMode } = useContext(MobileModeContext) as IMobileModeContext
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { sideBarOverlay, setSideBarOverlay } = 
    useContext(SideBarOverlayContext) as ISideBarOverlayContext


  // =========
  // functions
  // =========

  // overlay variables
  const isExpanded = sideBarOverlay.isExpanded || mobileMode.isActive
  const backgroundColor = 
    colorMode === 'light'
      ? isExpanded ? 'blue.50' : 'white'
      : isExpanded ? 'gray.700' : 'gray.800'

  

  // ==============
  // main component
  // ==============

  return (
    <Box 
      backgroundColor={backgroundColor}
      borderBottomRightRadius={14}
      position='absolute'
      onMouseEnter={() => setSideBarOverlay({
        ...sideBarOverlay, 
        isExpanded: true
      })}
      onMouseLeave={() => setSideBarOverlay({
        ...sideBarOverlay, 
        isExpanded: false
      })}
      transition={`all ${TRANSITION_DURATION}`}
      zIndex={1}
    >
      <Flex 
        align='flex-start'
        direction='column' 
        justify='flex-start' 
      > 
        <NavButton 
          sideBarNav={SideBarNav.HOME}
          icon={<Icon as={FaHouse} boxSize={6}/>}
          isActive={sideBarNav === SideBarNav.HOME}
        />
        <NavButton 
          sideBarNav={SideBarNav.PORTFOLIO} 
          icon={<Icon as={FaFolderOpen} boxSize={6}/>} 
          isActive={sideBarNav === SideBarNav.PORTFOLIO}
        />
        <NavButton 
          sideBarNav={SideBarNav.PRODUCT} 
          icon={<Icon as={FaBox} boxSize={6}/>} 
          isActive={sideBarNav === SideBarNav.PRODUCT}
        />
        <NavButton 
          sideBarNav={SideBarNav.ADD_PRODUCT} 
          icon={<Icon as={FaForward} boxSize={6}/>} 
          isActive={sideBarNav === SideBarNav.ADD_PRODUCT}
        />
      </Flex>
    </Box>
  )
}


// -- SideBar Content

type TSideBarContentProps = {
  index: number
}
const SideBarContent = (props: PropsWithChildren<TSideBarContentProps>) => {


  // =========
  // constants
  // =========

  const TABLIST_WIDTH = 14


  // =====
  // state
  // =====

  const { mobileMode } = useContext(MobileModeContext) as IMobileModeContext


  // ==============
  // main component
  // ==============

  return (
    <>
      <Tabs 
        index={props.index}
        orientation='vertical'
        variant='unstyled'
      >
        <TabList 
          height='100%' 
          minWidth={mobileMode.isActive ? undefined : TABLIST_WIDTH}
        />
        <TabPanels>
          <TabPanel>Home</TabPanel>
          <TabPanel>
            <PortfolioPanelManager />
          </TabPanel>          
          <TabPanel>Product</TabPanel>
          <TabPanel>
            <AddProductForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}


// ==============
// main component
// ==============

export const SideBar = () => {


  // =====
  // state
  // =====

  const { mobileMode } = useContext(MobileModeContext) as IMobileModeContext
  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { sideBarOverlay } = 
    useContext(SideBarOverlayContext) as ISideBarOverlayContext

  // overlay variables
  const displayOverlay = !mobileMode.isActive 
    || (mobileMode.isActive && sideBarOverlay.isOpen)


  // ==============
  // main component
  // ==============

  return (
    <>
      {displayOverlay && <SideBarOverlay />}
      <SideBarContent index={sideBarNav.order} />
    </>
  )
}
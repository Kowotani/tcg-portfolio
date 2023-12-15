import { 
  createRef, PropsWithChildren, useContext
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
import { IconType } from 'react-icons'
import { FaBox, FaFolderOpen, FaHouse, FaForward } from 'react-icons/fa6'
import { CSSTransition } from 'react-transition-group'
import { MobileModeContext } from '../state/MobileModeContext'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { SideBarOverlayContext } from '../state/SideBarOverlayContext'
import { CascadingSlideFade } from './Transitions'
import { IMobileModeContext } from '../utils/mobile'
import { 
  ISideBarNav, ISideBarNavContext, ISideBarOverlayContext, SideBarNav 
} from '../utils/SideBar'


import '../stylesheets/SideBar.css'


// =========
// constants
// =========

const BACKGROUND_TRANSITION_DURATION = 200
const EXIT_TRANSITION_DELAY = 300
const TRANSITION_DURATION = 500


// ==============
// sub components
// ==============

// -- Nav Button

type TNavButtonProps = {
  icon: IconType,
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
  const { setSideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { sideBarOverlay } = 
    useContext(SideBarOverlayContext) as ISideBarOverlayContext


  // overlay variables
  const backgroundColor = colorMode === 'light' ? 'blue.200' : 'blue.300'


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
      transition={`background-color ${BACKGROUND_TRANSITION_DURATION}ms`}
    >
      <Flex 
        align='center' 
        justify='flex-start'
        width={sideBarOverlay.isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
        transition={`width ${TRANSITION_DURATION}ms`}
      > 
        <Icon as={props.icon} boxSize={6}/>
        <Text 
          opacity={sideBarOverlay.isExpanded ? 1 : 0}
          paddingLeft={2}
          transition={`opacity ${TRANSITION_DURATION}ms`}
        >
          {props.sideBarNav.name}
        </Text>
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

  //  Handle onMouseEnter event for overlay
  function handleMouseEnter(): void {
    if (!mobileMode.isActive) {
      setSideBarOverlay({
        ...sideBarOverlay, 
        isExpanded: true
      })
    }
  }

  // Handle onMouseEnter event for overlay
  function handleMouseLeave(): void {
    if (!mobileMode.isActive) {
      setSideBarOverlay({
        ...sideBarOverlay, 
        isExpanded: false
      })
    }
  }


  // =======
  // generic
  // =======

  // overlay variables
  const backgroundColor = 
    colorMode === 'light'
      ? sideBarOverlay.isExpanded ? 'gray.100' : 'white'
      : sideBarOverlay.isExpanded ? 'gray.700' : 'gray.800'

  // -- NavButton Items
  const navButtonItems: TNavButtonProps[] = [
    {
      sideBarNav: SideBarNav.HOME,
      icon: FaHouse,
      isActive: sideBarNav === SideBarNav.HOME
    },
    {
      sideBarNav: SideBarNav.PORTFOLIO,
      icon: FaFolderOpen,
      isActive: sideBarNav === SideBarNav.PORTFOLIO
    },
    {
      sideBarNav: SideBarNav.PRODUCT,
      icon: FaBox,
      isActive: sideBarNav === SideBarNav.PRODUCT
    },
    {
      sideBarNav: SideBarNav.ADD_PRODUCT,
      icon: FaForward,
      isActive: sideBarNav === SideBarNav.ADD_PRODUCT
    },
  ]

  // CSSTransition refs
  const nodeRef = createRef<any>()


  // ==============
  // main component
  // ==============

  return (
    <CSSTransition<any>
      appear={true}
      classNames={'sidebaroverlay'}
      in={sideBarOverlay.isOpen}
      mountOnEnter={true}
      nodeRef={nodeRef}
      timeout={{
        appear: TRANSITION_DURATION,
        enter: TRANSITION_DURATION,
        exit: TRANSITION_DURATION + EXIT_TRANSITION_DELAY
      }}
      unmountOnExit={true}
    >
      <Box 
        backgroundColor={backgroundColor}
        borderBottomRightRadius={14}
        position='absolute'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={nodeRef}
        transition={!mobileMode.isActive
          ? `background-color ${TRANSITION_DURATION}ms`
          : undefined
        }
        zIndex={1}
      >
        <Flex 
          align='flex-start'
          direction='column' 
          justify='flex-start' 
        > 
          {navButtonItems.map((props: TNavButtonProps, ix: number) => {
            return (
              <CascadingSlideFade
                key={props.sideBarNav.name}
                index={ix}
                duration={0.5}
                enterDelay={0.1}
                exitDelay={0}
                inState={sideBarOverlay.isOpen}
                itemDelay={0.075}
                numItems={navButtonItems.length}
                slideOffsetY={0}
                transitionType='in-out'
              >
                <NavButton 
                  sideBarNav={props.sideBarNav}
                  icon={props.icon}
                  isActive={props.isActive}
                />
              </CascadingSlideFade>
            )
          })}
        </Flex>
      </Box>
    </CSSTransition>
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

  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext


  // ==============
  // main component
  // ==============

  return (
    <>
      <SideBarOverlay />
      <SideBarContent index={sideBarNav.order} />
    </>
  )
}
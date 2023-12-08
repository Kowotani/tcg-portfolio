import { 
  ReactNode, PropsWithChildren, useContext, useState 
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
import { SideBarNavContext } from '../state/SideBarNavContext'
import { ISideBarNav, ISideBarNavContext, SideBarNav } from '../utils/SideBar'


// ==============
// sub components
// ==============

// -- Nav Button

type TNavButtonProps = {
  icon: ReactNode,
  isActive: boolean,
  isExpanded: boolean,
  sideBarNav: ISideBarNav,
}
const NavButton = (props: PropsWithChildren<TNavButtonProps>) => {

  const { setSideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { colorMode } = useColorMode()

  const backgroundColor = colorMode === 'light' ? 'blue.200' : 'blue.300'

  return (
    <Box
      bg={props.isActive ? backgroundColor : undefined}
      borderRadius={12}
      justifyContent='flex-start'
      m={2}
      onClick={() => {setSideBarNav(props.sideBarNav)}}
      overflow='hidden'
      p={2}
      
    >
      {/* TODO: Change width to be unitless */}
      <Flex 
        align='center' 
        justify='flex-start'
        width={props.isExpanded ? '96px' : '24px'}
        transition='width 0.3s'
      > 
        {props.icon}
        {props.isExpanded && (
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
type TSideBarOverlay = {
  isExpanded: boolean,
  isMobile: boolean,
  collapseOverlay: () => void,
  expandOverlay: () => void,
}
const SideBarOverlay = (props: PropsWithChildren<TSideBarOverlay>) => {


  // =====
  // state
  // =====

  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext
  const { colorMode } = useColorMode()

  const backgroundColor = 
    colorMode === 'light'
      ? props.isExpanded
        ? 'gray.50'
        : 'white'
      : props.isExpanded
        ? 'gray.700'
        : 'gray.800'


  // ==============
  // main component
  // ==============

  return (
    <Box 
      backgroundColor={backgroundColor}
      position='absolute'
      onMouseEnter={props.expandOverlay}
      onMouseLeave={props.collapseOverlay}
      transition='background-color 0.3s'
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
          isExpanded={props.isExpanded}
        />
        <NavButton 
          sideBarNav={SideBarNav.PORTFOLIO} 
          icon={<Icon as={FaFolderOpen} boxSize={6}/>} 
          isExpanded={props.isExpanded}
          isActive={sideBarNav === SideBarNav.PORTFOLIO}
        />
        <NavButton 
          sideBarNav={SideBarNav.PRODUCT} 
          icon={<Icon as={FaBox} boxSize={6}/>} 
          isExpanded={props.isExpanded}
          isActive={sideBarNav === SideBarNav.PRODUCT}
        />
        <NavButton 
          sideBarNav={SideBarNav.ADD_PRODUCT} 
          icon={<Icon as={FaForward} boxSize={6}/>} 
          isExpanded={props.isExpanded}
          isActive={sideBarNav === SideBarNav.ADD_PRODUCT}
        />
      </Flex>
    </Box>
  )
}


// -- SideBar Content

type TSideBarContentProps = {
  index: number,
  isMobile: boolean
}
const SideBarContent = (props: PropsWithChildren<TSideBarContentProps>) => {


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
        <TabList height='100%' minWidth={14}/>
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

  const [ isMobile, setIsMobile ] = useState(false)
  const [ isExpanded, setIsExpanded ] = useState(false)

  const { sideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext


  // ========
  // function
  // ========

  function collapseOverlay(): void {
    setIsExpanded(false)
  }

  function expandOverlay(): void {
    setIsExpanded(true)
  }

  // ==============
  // main component
  // ==============

  return (
    <>
      <SideBarOverlay 
        collapseOverlay={collapseOverlay}
        expandOverlay={expandOverlay}
        isExpanded={isExpanded}
        isMobile={isMobile}
      />
      <SideBarContent 
        index={sideBarNav.order}
        isMobile={isMobile}
      />
    </>
  )
}
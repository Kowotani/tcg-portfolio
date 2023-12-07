import { ReactNode, PropsWithChildren, useContext } from 'react'
import {    
  Flex,
  Icon,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { AddProductForm } from './AddProductForm'
import { PortfolioPanelManager } from './PortfolioPanelManager'
import { FaFolder, FaHouse, FaSquarePlus } from 'react-icons/fa6'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { ISideBarNav, ISideBarNavContext, SideBarNav } from '../utils/SideBar'


// =============
// sub component
// =============

type TNavTabProps = {
  sideBarNav: ISideBarNav,
  icon: ReactNode
}
const NavTab = (props: PropsWithChildren<TNavTabProps>) => {

  const { setSideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext

  return (
    <Tab
      onClick={() => {setSideBarNav(props.sideBarNav)}}
      justifyContent='flex-start'
    >
      <Flex direction='row' align='center'> 
        {props.icon}
        <Spacer width={3}/>
        <Text>
          {props.sideBarNav.name}
        </Text>
      </Flex>
    </Tab>
  )
}


// ==============
// main component
// ==============

export const SideBar = () => {

  return (
    <>
      <Tabs 
        orientation='vertical'
        variant='soft-rounded'
        colorScheme='blue'
      >
        <TabList>
          <NavTab 
            sideBarNav={SideBarNav.HOME}
            icon={<Icon as={FaHouse} boxSize={6}/>}
          />
          <NavTab 
            sideBarNav={SideBarNav.PORTFOLIO} 
            icon={<Icon as={FaFolder} boxSize={6}/>} 
          />
          <NavTab 
            sideBarNav={SideBarNav.ADD_PRODUCT} 
            icon={<Icon as={FaSquarePlus} boxSize={6}/>} 
          />
        </TabList>

        <TabPanels>
          <TabPanel>Home</TabPanel>
          <TabPanel>
            <PortfolioPanelManager />
          </TabPanel>          
          <TabPanel>
            <AddProductForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
    )
}
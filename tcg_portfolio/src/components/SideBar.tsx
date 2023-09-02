import { PropsWithChildren, useContext } from 'react'
import { 
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { AddProductForm } from './AddProductForm'
import { PortfolioPanelManager } from './PortfolioPanelManager'
import { SideBarNavContext } from '../state/SideBarNavContext'
import { ISideBarNav, ISideBarNavContext, SideBarNav } from '../utils'

// ==============
// Sub Components
// ==============

type TNavTabProps = {
  sideBarNav: ISideBarNav
}

const NavTab = (props: PropsWithChildren<TNavTabProps>) => {

  const { setSideBarNav } = useContext(SideBarNavContext) as ISideBarNavContext

  return (
    <Tab
      onClick={() => {setSideBarNav(props.sideBarNav)}}
    >
      {props.sideBarNav.name}
    </Tab>
  )
}


// ==============
// Main Component
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
          <NavTab sideBarNav={SideBarNav.HOME}/>
          <NavTab sideBarNav={SideBarNav.PORTFOLIO} />
          <NavTab sideBarNav={SideBarNav.ADD_PRODUCT} />
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
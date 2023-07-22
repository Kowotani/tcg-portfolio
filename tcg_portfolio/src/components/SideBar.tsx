import { PropsWithChildren, useContext } from 'react';
import { 
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { AddProductForm } from './AddProductForm';
import { SideBarNavContext } from '../state/SideBarNavContext';
import { ISideBarNav, SideBarNav } from '../utils';


// ==============
// sub-components
// ==============

type TNavTabProps = {
  sideBarNav: ISideBarNav
}

const NavTab = (props: PropsWithChildren<TNavTabProps>) => {

  const { setSideBarNav } = useContext(SideBarNavContext)

  return (
    <Tab
      onClick={() => {setSideBarNav(props.sideBarNav)}}
    >
      {props.sideBarNav.name}
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
          <NavTab sideBarNav={SideBarNav.HOME}/>
          <NavTab sideBarNav={SideBarNav.PORTFOLIO} />
          <NavTab sideBarNav={SideBarNav.ADD_PRODUCT} />
        </TabList>

        <TabPanels>
          <TabPanel>Home</TabPanel>
          <TabPanel>Portfolio</TabPanel>          
          <TabPanel>
            <AddProductForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
    )
}
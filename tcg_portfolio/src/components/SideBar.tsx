import { FunctionComponent, ReactElement } from 'react';
import { 
    Box,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
} from '@chakra-ui/react';
import { AddProductForm } from './AddProductForm';

export const SideBar: FunctionComponent<{}> = () => {

    return (
        <Tabs 
            orientation='vertical'
            variant='soft-rounded'
            colorScheme='blue'
        >
            <TabList>
                <Tab>Home</Tab>
                <Tab>Portfolio</Tab>
                <Tab>Product</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <h1>Home</h1>
                </TabPanel>
                <TabPanel>
                    <h1>Portfolio</h1>
                </TabPanel>
                <TabPanel>
                    <AddProductForm />
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}
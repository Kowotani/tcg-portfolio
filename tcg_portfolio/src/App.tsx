import {
  ChakraProvider,
  Flex,
  theme,
} from '@chakra-ui/react'
import { Logo } from './Logo'
import { Header } from './components/Header'
import { SideBar } from './components/SideBar'
import { LatestPricesProvider } from './state/LatestPricesContext'
import { SideBarNavProvider } from './state/SideBarNavContext'
import { UserProvider } from './state/UserContext'


// ========
// Main App
// ========

export const App = () => (
  <ChakraProvider theme={theme}>
    <LatestPricesProvider>
      <SideBarNavProvider>
        <UserProvider>
  
          <>
            <Header />
            <SideBar />
            <Flex justify='center'>
              <Logo h='30vmin' />
            </Flex>
          </>
          
        </UserProvider>
      </SideBarNavProvider>
    </LatestPricesProvider>
  </ChakraProvider>
)

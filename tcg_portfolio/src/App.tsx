import {
  ChakraProvider,
  Flex,
  theme,
} from '@chakra-ui/react'
import { Logo } from './Logo'
import { Header } from './components/Header'
import { SideBar } from './components/SideBar'
import { LatestPricesProvider } from './state/LatestPricesContext'
import { MobileModeProvider } from './state/MobileModeContext'
import { SideBarNavProvider } from './state/SideBarNavContext'
import { SideBarOverlayProvider } from './state/SideBarOverlayContext'
import { UserProvider } from './state/UserContext'


// ========
// Main App
// ========

export const App = () => (

  <ChakraProvider theme={theme}>
    <LatestPricesProvider>
      <MobileModeProvider>
        <SideBarNavProvider>
          <SideBarOverlayProvider>
            <UserProvider>
    
              <>
                <Header />
                <SideBar />
              </>
              
            </UserProvider>
          </SideBarOverlayProvider>
        </SideBarNavProvider>
      </MobileModeProvider>
    </LatestPricesProvider>
  </ChakraProvider>
  
)

import {
  ChakraProvider,
  Box,
  Link,
  VStack,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { SideBar } from "./components/SideBar"
import { LatestPricesProvider } from "./state/LatestPricesContext"
import { SideBarNavProvider } from "./state/SideBarNavContext"
import { UserProvider } from "./state/UserContext"


// ========
// Main App
// ========

export const App = () => (
  <ChakraProvider theme={theme}>
    <LatestPricesProvider>
      <SideBarNavProvider>
        <UserProvider>
      
          <Box textAlign="center" fontSize="xl">
            <ColorModeSwitcher justifySelf="flex-end" />
            <SideBar />
            <VStack spacing={8}>
              <Logo h="40vmin" pointerEvents="none" />
              <Link
                color="teal.500"
                href="https://chakra-ui.com"
                fontSize="2xl"
                target="_blank"
                rel="noopener noreferrer"
              >
              Learn Chakra
            </Link>
            </VStack>
          </Box>
          
        </UserProvider>
      </SideBarNavProvider>
    </LatestPricesProvider>
  </ChakraProvider>
)

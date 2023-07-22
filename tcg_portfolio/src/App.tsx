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

import { SideBarNavProvider } from "./state/SideBarNavContext"


// ========
// Main App
// ========

export const App = () => (
  <ChakraProvider theme={theme}>
    <SideBarNavProvider>
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
    </SideBarNavProvider>
  </ChakraProvider>
)

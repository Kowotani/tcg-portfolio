import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { SideBar } from "./components/SideBar"

export const App = () => (
  <ChakraProvider theme={theme}>
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
  </ChakraProvider>
)

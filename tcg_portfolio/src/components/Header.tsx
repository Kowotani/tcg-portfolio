import { useRef } from 'react'
import {
  Flex,
  IconButton,
  Spacer
} from '@chakra-ui/react'
import { FaUser } from 'react-icons/fa'
import { SiWasmer } from 'react-icons/si'
import { ColorModeSwitcher } from './ColorModeSwitcher'


// =============
// sub component
// =============

const UserPanel = () => {

  return (
    <Flex direction='row' align='center'>
      {/* TODO: implement functionality */}
      <IconButton 
        aria-label='User account' 
        icon={<FaUser />} 
        fontSize={20}
        size='md'
        variant='ghost'
      />
      <ColorModeSwitcher />
    </Flex>
  )
}

// ==============
// main component
// ==============

export const Header = () => {

  const sideBarRef = useRef(null)

  return (
    <Flex 
      align='center'  
      height={14} 
      justify='flex-end' 
      borderBottom='1px solid'
    >
      <IconButton 
        aria-label='Header menu'        
        icon={<SiWasmer />} 
        fontSize={40}
        variant='ghost'
        margin={2}
      />
      <Spacer />
      <UserPanel />
    </Flex>
    )
}
import { PropsWithChildren, useContext } from 'react'
import {    
  Flex,
  Icon,
  IconButton,
  Spacer,
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
        variant='ghost'
        size='md'
        fontSize='lg'
      />
      <ColorModeSwitcher />
    </Flex>
  )
}

// ==============
// main component
// ==============

export const Header = () => {

  return (
    <Flex direction='row' align='center'>
      <Icon as={SiWasmer} boxSize={10} margin={4}/>
      <Spacer />
      <UserPanel />
    </Flex>
    )
}
import { PropsWithChildren } from 'react'
import { 
  Box,
  StackDivider
} from '@chakra-ui/react'


// ==========
// components
// ==========

// -- section header
type TSectionHeaderProps = {
  header: string
}
export const SectionHeader = (
  props: PropsWithChildren<TSectionHeaderProps>
) => {

  return (
    <Box 
      bg='teal.500' 
      color='white'
      textAlign='center'
      fontWeight='bold' 
      p='8px'
      m='16px 0px'
    >
      {props.header}
    </Box>    
  )
}

// -- stack divider
export const Divider = () => {
  return <StackDivider borderColor='gray.200'/>
}
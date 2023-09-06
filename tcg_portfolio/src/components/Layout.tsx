import { PropsWithChildren } from 'react'
import { 
  Box
} from '@chakra-ui/react'


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
      fontWeight='medium' 
      p='8px'
      m='16px 0px'
    >
      {props.header}
    </Box>    
  )
}
import { 
  Box,
  Button,
  ButtonProps,
  Icon
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'


// ==========
// components
// ==========

type TSectionHeaderProps = {
  header: string
}
export const SectionHeader = (props: TSectionHeaderProps) => {

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

type TAddButtonProps = ButtonProps & {
  label: string
}
export const AddButton = (props: TAddButtonProps) => {
  return (
    <Button
      {...props}
      colorScheme='green'
      leftIcon={<Icon as={FiPlus} />}
    >
      {props.label}
    </Button>
  )
}
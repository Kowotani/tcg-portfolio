import { 
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Icon,
  ListItem,
  Text,
  UnorderedList
} from '@chakra-ui/react'
import { FiChevronRight, FiPlus } from 'react-icons/fi'


// ==========
// components
// ==========

// -----------
// breadcrumbs
// -----------

// TODO: Fix vertical alignment on separator
type TBreadcrumbProps = BoxProps & {
  path: string[]
}
export const Breadcrumbs = (props: TBreadcrumbProps) => {
  return (
    <UnorderedList 
      display='flex' 
      alignItems='center' 
      height={props.height}
      listStyleType='none'
      marginLeft={0}
      marginRight={4}
    >
      {props.path.map((step: string, ix: number) => {
        return (
          <ListItem
            key={ix} 
            display='flex' 
            alignItems='center' 
            float='left'
          >           
            <Text noOfLines={1}>{step}</Text>
            {ix < props.path.length - 1 
              && <Icon as={FiChevronRight} boxSize={5} m={2}/>}
          </ListItem>
        )
      })}
    </UnorderedList>
  )
}

// -------
// buttons
// -------

type TLabelledButtonProps = ButtonProps & {
  label: string
}

export const AddButton = (props: TLabelledButtonProps) => {
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

export const DeleteButton = (props: TLabelledButtonProps) => {
  return (
    <Button
      {...props}
      colorScheme='red'
    >
      {props.label}
    </Button>
  )
}

export const PrimaryButton = (props: TLabelledButtonProps) => {
  return (
    <Button
      {...props}
      colorScheme='blue'
    >
      {props.label}
    </Button>
  )
}

export const SecondaryButton = (props: TLabelledButtonProps) => {
  return (
    <Button
      {...props}
      variant='ghost'
    >
      {props.label}
    </Button>
  )
}

// -------
// headers
// -------

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
import { 
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonProps,
  Icon,
  Text
} from '@chakra-ui/react'
import { FiChevronRight, FiPlus } from 'react-icons/fi'


// ==========
// components
// ==========

// -----------
// breadcrumbs
// -----------

// TODO: Fix vertical alignment on separator
type TBreadcrumbProps = {
  path: string[]
}
export const Breadcrumbs = (props: TBreadcrumbProps) => {
  return (
    <Breadcrumb
      separator={<Icon as={FiChevronRight}/>}
    >
        {props.path.map((step: string) => {
          return (
            <BreadcrumbItem key={step}>
              <Text>{step}</Text>
            </BreadcrumbItem>
          )
        })}
    </Breadcrumb>
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
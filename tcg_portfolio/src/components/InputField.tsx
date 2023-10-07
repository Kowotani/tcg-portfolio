import { PropsWithChildren } from 'react'
import { 
  Box,
  InputGroup, 
  InputLeftAddon, 
  InputRightAddon,
  Tooltip,
  VStack
} from '@chakra-ui/react'


// ==========
// Components
// ==========

// Error message tooltip
type TErrorTooltipProps = {
  label: string,
  isOpen?: boolean,
}
const ErrorTooltip = (props: PropsWithChildren<TErrorTooltipProps>) => {

  return (
    <Tooltip 
      label={props.label} 
      bg='red'
      color='white'
      placement='bottom-start'
      gutter={3} 
      isOpen={props.isOpen}
    >
      {props.children}
    </Tooltip>
  )
}

// Input error wrapper
type TInputErrorWrapperProps = {
  errorMessage?: string,
  isErrorDisplayed?: boolean,
  leftLabel?: string,
  rightLabel?: string,
  width?: string,
}
export const InputErrorWrapper = (
  props: PropsWithChildren<TInputErrorWrapperProps>
) => {

  return (
    <InputGroup>
      {props.leftLabel 
        ? <InputLeftAddon children={props.leftLabel} /> 
        : undefined
      }
      <VStack 
        display='flex'
        direction='column'
        align='flex-start'
        spacing={0}
        width={props.width ?? '100%'}
      >
      {props.children}
      {props.isErrorDisplayed && props.errorMessage
        ? (
          <ErrorTooltip 
            label={props.errorMessage} 
            isOpen={true}
          >
            <Box />
          </ErrorTooltip>
        ) : undefined
      }    
      </VStack>        
      {props.rightLabel 
        ? <InputRightAddon children={props.rightLabel} /> 
        : undefined
      }
    </InputGroup>
  )
}
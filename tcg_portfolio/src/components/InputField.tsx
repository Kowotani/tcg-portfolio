import { FunctionComponent, ReactElement } from 'react';
import { 
    Box,
    InputGroup, 
    InputLeftAddon, 
    InputRightAddon,
    Tooltip,
    VStack
} from '@chakra-ui/react';


// ============
// Shared Types
// ============

type TInputErrorWrapperProps = {
    children: JSX.Element | JSX.Element[],
    errorMessage?: string,
    leftLabel?: string,
    rightLabel?: string,
    width?: string,
}


// ==========
// Components
// ==========

// Error message tooltip
type ErrorTooltipProps = {
    label: string,
    children: JSX.Element | JSX.Element[],
    isOpen?: boolean,
}
const ErrorTooltip: FunctionComponent<ErrorTooltipProps> = ({
    label,
    children,
    isOpen = false,
}): ReactElement => {

    return (
        <Tooltip 
            label={label} 
            bg='red'
            color='white'
            placement='bottom-start'
            gutter={3} 
            isOpen={isOpen}
        >
            {children}
        </Tooltip>
    )
}

// Input error wrapper
export const InputErrorWrapper: FunctionComponent<TInputErrorWrapperProps> = ({
    children,
    errorMessage = undefined,
    leftLabel = undefined,
    rightLabel = undefined,
    width = '100%',
}): ReactElement => {

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : undefined}
            <VStack 
                display='flex'
                direction='column'
                align='flex-start'
                spacing={0}
                width={width}
            >
            {children}
            {errorMessage 
                    ? (<ErrorTooltip label={errorMessage} isOpen={true}>
                        <Box />
                    </ErrorTooltip>
                    ) : undefined
                }    
            </VStack>        
            {rightLabel ? <InputRightAddon children={rightLabel} /> : undefined}
        </InputGroup>
    )
}
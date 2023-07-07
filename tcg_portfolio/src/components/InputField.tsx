import { FunctionComponent, ReactElement } from 'react';
import { ICommonProps } from '../react-utils';
import { 
    Box,
    Input, 
    InputGroup, 
    InputLeftAddon, 
    InputRightAddon,
    NumberInput,
    NumberInputField,
    Select,
    Tooltip,
    VStack
} from '@chakra-ui/react';


// ============
// Shared Types
// ============

type TInputProps = ICommonProps & {
    leftLabel?: string,
    rightLabel?: string,
    isDisabled?: boolean,
    isInvalid?: boolean,
    isRequired?: boolean,
    errorMessage?: string,
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


// Date input
type DateInputProps = TInputProps & {
    value?: number
}
export const DateInput: FunctionComponent<DateInputProps> = ({
    value = undefined, 
    leftLabel = undefined, 
    rightLabel = undefined, 
    isDisabled = false,
    isInvalid = false, 
    isRequired = false,
    errorMessage = undefined,
}): ReactElement => {

    const DateComponent = (): JSX.Element => {
        return (
            <Input 
                type='date' 
                isDisabled={isDisabled}
                isInvalid={isInvalid}
                isRequired={isRequired} 
                value={value}
            />
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : undefined}
            <VStack 
                display='flex'
                direction='column'
                align='flex-start'
                spacing={0}
            >
                <DateComponent />
                {errorMessage 
                    ? (<ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box />
                    </ErrorTooltip>
                    ) : undefined
                }
            </VStack>
            {rightLabel ? <InputRightAddon children={rightLabel} /> : undefined}
        </InputGroup>
    )
}


// Numeric input
type TNumericInputProps = TInputProps & {
    defaultValue?: number
    max?: number
    min?: number
    precision?: number
}
export const NumericInput: FunctionComponent<TNumericInputProps> = ({
    defaultValue = undefined,
    max = undefined,
    min = undefined, 
    precision = 0,
    leftLabel = undefined, 
    rightLabel = undefined, 
    isDisabled = false,
    isInvalid = false, 
    isRequired = false,
    errorMessage = undefined,
}) => {
   
    const NumericComponent = (): JSX.Element => {
        return (
            <NumberInput
                isDisabled={isDisabled} 
                isInvalid={isInvalid}
                isRequired={isRequired} 
                defaultValue={defaultValue}
                min={min}
                max={max}
                precision={precision}
            >
                <NumberInputField />
            </NumberInput>
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            <VStack 
                display='flex'
                direction='column'
                align='flex-start'
                spacing={0}
            >
                <NumericComponent />
                {errorMessage 
                    ? (<ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box />
                    </ErrorTooltip>
                    ) : undefined
                }
            </VStack>
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}


// Select input
type TSelectInputProps = TInputProps & {
    placeholder: string,
    values: string[],
}
export const SelectInput: FunctionComponent<TSelectInputProps> = ({
    placeholder, 
    values,
    leftLabel = undefined, 
    rightLabel = undefined, 
    isDisabled = false,
    isInvalid = false, 
    isRequired = false,
    errorMessage = undefined,
}) => {

    const SelectComponent = (): JSX.Element => {
        return (
            <Select
                isDisabled={isDisabled}
                isInvalid={isInvalid}
                isRequired={isRequired} 
                placeholder={placeholder} 
            >            
                {values.map(value => {
                    return (
                        <option value={value}>{value}</option>
                    )})
                }
            </Select>
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            <VStack 
                display='flex'
                direction='column'
                align='flex-start'
                spacing={0}
            >
                <SelectComponent />
                {errorMessage 
                    ? (<ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box />
                    </ErrorTooltip>
                    ) : undefined
                }
            </VStack>
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}


// Text input
type TTextInputProps = TInputProps & {
    placeholder: string
}
export const TextInput: FunctionComponent<TTextInputProps> = ({
    placeholder, 
    leftLabel = undefined, 
    rightLabel = undefined, 
    isDisabled = false,
    isInvalid = false, 
    isRequired = false,
    errorMessage = undefined,
}) => {
   
    const TextComponent = (): JSX.Element => {
        return (
            <Input 
                isDisabled={isDisabled}
                isInvalid={isInvalid}
                isRequired={isRequired} 
                placeholder={placeholder} 
            />
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            <VStack 
                display='flex'
                direction='column'
                align='flex-start'
                spacing={0}
            >
                <TextComponent />
                {errorMessage 
                    ? (<ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box />
                    </ErrorTooltip>
                    ) : undefined
                }
            </VStack>
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}
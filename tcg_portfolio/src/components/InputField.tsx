import { FunctionComponent } from 'react';
import { 
    Box,
    Input, 
    InputGroup, 
    InputLeftAddon, 
    InputRightAddon,
    NumberInput,
    NumberInputField,
    Select,
    Tooltip
} from '@chakra-ui/react';


// =================
// Shared Interfaces
// =================

interface IInputProps {
    leftLabel?: string,
    rightLabel?: string,
    isInvalid?: boolean,
    isRequired?: boolean,
    errorMessage?: string,
}


// ==========
// Components
// ==========

// Error message tooltip
interface ErrorTooltipProps {
    label: string,
    children: JSX.Element | JSX.Element[],
    isOpen?: boolean,
}
const ErrorTooltip: FunctionComponent<ErrorTooltipProps> = ({
    label,
    children,
    isOpen = false,
}) => {

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
interface IDateInputProps extends IInputProps {
    value?: string
}
export const DateInput: FunctionComponent<IDateInputProps> = ({
    value = undefined, 
    leftLabel = null, 
    rightLabel = null, 
    isInvalid = false, 
    isRequired = false,
    errorMessage = null,
}) => {

    const DateComponent = (): JSX.Element => {
        return (
            <Input 
                type='date' 
                isInvalid={isInvalid}
                isRequired={isRequired} 
                value={value} 
            />
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            {errorMessage 
                ? (
                    <ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box>
                            <DateComponent />
                        </Box>
                    </ErrorTooltip>
                ) : (
                    <DateComponent />
                )
            }
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}


// Select input
interface ISelectInputProps extends IInputProps {
    placeholder: string,
    values: string[],
}
export const SelectInput: FunctionComponent<ISelectInputProps> = ({
    placeholder, 
    values,
    leftLabel = null, 
    rightLabel = null, 
    isInvalid = false, 
    isRequired = false,
    errorMessage = null,
}) => {

    const SelectComponent = (): JSX.Element => {
        return (
            <Select
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
            {errorMessage 
                ? (
                    <ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box>
                            <SelectComponent />
                        </Box>
                    </ErrorTooltip>
                ) : (
                    <SelectComponent />
                )
            }
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}


// Text input
interface ITextInputProps extends IInputProps {
    placeholder: string
}
export const TextInput: FunctionComponent<ITextInputProps> = ({
    placeholder, 
    leftLabel = null, 
    rightLabel = null, 
    isInvalid = false, 
    isRequired = false,
    errorMessage = null,
}) => {
   
    const InputComponent = (): JSX.Element => {
        return (
            <Input 
                isInvalid={isInvalid}
                isRequired={isRequired} 
                placeholder={placeholder} 
            />
        )
    }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            {errorMessage 
                ? (
                    <ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Box>
                            <InputComponent />
                        </Box>
                    </ErrorTooltip>
                ) : (
                    <InputComponent />
                )
            }
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}
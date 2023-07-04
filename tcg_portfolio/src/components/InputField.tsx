import { FunctionComponent } from 'react';
import { 
    Input, 
    InputGroup, 
    InputLeftAddon, 
    InputRightAddon,
    Select,
    Tooltip
} from '@chakra-ui/react';


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
interface DateInputProps {
    value?: string
    leftLabel?: string,
    rightLabel?: string,
    isInvalid?: boolean,
    isRequired?: boolean,
    errorMessage?: string,
}
export const DateInput: FunctionComponent<DateInputProps> = ({
    value = undefined, 
    leftLabel = null, 
    rightLabel = null, 
    isInvalid = false, 
    isRequired = false,
    errorMessage = null,
}) => {

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            {errorMessage 
                ? (
                    <ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Input
                            type='date' 
                            isInvalid={isInvalid}
                            isRequired={isRequired} 
                            value={value} 
                        />
                    </ErrorTooltip>
                ) : (
                    <Input 
                        type='date'
                        isInvalid={isInvalid}
                        isRequired={isRequired} 
                        value={value} 
                    />
                )
            }
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}


// Select input
interface SelectInputProps {
    placeholder: string,
    values: string[],
    leftLabel?: string,
    rightLabel?: string,
    isInvalid?: boolean,
    isRequired?: boolean,
    errorMessage?: string,
}
export const SelectInput: FunctionComponent<SelectInputProps> = ({
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
                        <SelectComponent />
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
interface TextInputProps {
    placeholder: string
    leftLabel?: string,
    rightLabel?: string,
    isInvalid?: boolean,
    isRequired?: boolean,
    errorMessage?: string,
}
export const TextInput: FunctionComponent<TextInputProps> = ({
    placeholder, 
    leftLabel = null, 
    rightLabel = null, 
    isInvalid = false, 
    isRequired = false,
    errorMessage = null,
}) => {
   
    // const InputField = () => {
    //     return (
    //         <Input 
    //             isInvalid={isInvalid}
    //             isRequired={isRequired} 
    //             placeholder={placeholder} 
    //         />
    //     )
    // }

    return (
        <InputGroup>
            {leftLabel ? <InputLeftAddon children={leftLabel} /> : null}
            {errorMessage 
                ? (
                    <ErrorTooltip label={errorMessage} isOpen={isInvalid}>
                        <Input 
                            isInvalid={isInvalid}
                            isRequired={isRequired} 
                            placeholder={placeholder} 
                        />
                    </ErrorTooltip>
                ) : (
                    <Input 
                        isInvalid={isInvalid}
                        isRequired={isRequired} 
                        placeholder={placeholder} 
                    />
                )
            }
            {rightLabel ? <InputRightAddon children={rightLabel} /> : null}
        </InputGroup>
    )
}
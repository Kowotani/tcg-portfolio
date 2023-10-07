import React, { PropsWithChildren } from 'react'
import { 
  Box,
  BoxProps, 
  Icon,
  IconButton,
  Input, 
  InputGroup, 
  InputLeftElement,
  InputRightElement,   
} from '@chakra-ui/react'
import { FaFilter, FaRegTimesCircle } from 'react-icons/fa'

// https://github.com/GastonKhouri/chakra-ui-search/blob/main/src/components/Search.tsx


type TFilterInput = BoxProps & {
  value: string;
	onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  clearFilter?: () => void;
  placeholder?: string;
}

export const FilterInput = (props: PropsWithChildren<TFilterInput>) => {

  const {
		value,
		onFilterChange,
    clearFilter,
		placeholder = '',
	} = props

  return (
		<Box
			position='relative'
			w='100%'
		>
      {/* Filter input */}
			<InputGroup mb='10px'>
        <InputLeftElement
          pointerEvents='none'
          children={<Icon as={FaFilter} color='gray.500' />}
        />

				<Input
					placeholder={placeholder}
					value={value}
					onChange={onFilterChange}
				/>

        {value.length > 0 
          ? (
            <InputRightElement 
              children={
                <IconButton 
                  aria-label='Clear search'
                  color='gray.500'
                  fontSize='20px'
                  icon={<FaRegTimesCircle />}
                  isRound={true}
                  onClick={() => (clearFilter ? clearFilter() : undefined)}
                  variant='ghost'
                />
              }
            />
          ) : undefined

        }
			</InputGroup>
		</Box>
	)
}
import React, { PropsWithChildren, useState } from 'react'
import { 
  Box,
  BoxProps, 
  Flex,
  Icon,
  IconButton,
  Input, 
  InputGroup, 
  InputLeftElement,
  InputRightElement,   
  Text,
  useColorMode
} from '@chakra-ui/react'
import { FaRegTimesCircle, FaSearch } from 'react-icons/fa'
import { 
  getColorForBackground, getColorForBackgroundHover, getColorForText 
} from '../utils/generic'


// https://github.com/GastonKhouri/chakra-ui-search/blob/main/src/components/Search.tsx

type TSearchInput = BoxProps & {
  value: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	searchResultRenderer: (result: any) => JSX.Element;
  searchResultKey: string;
	onSearchResultSelect: (result: any) => void;
  clearSearch?: () => void;
  maxSearchResults?: number;
	noSearchResultsComponent?: JSX.Element;
  placeholder?: string;
  searchResultsMaxHeight?: string;
  searchResults?: any[];
}

export const SearchInput = (props: PropsWithChildren<TSearchInput>) => {

  // destructure props
  const {
		value,
		onSearchChange,
		searchResultRenderer,
		onSearchResultSelect,
    clearSearch,
    maxSearchResults,
    noSearchResultsComponent,
		placeholder = '',
    searchResultKey,
    searchResultsMaxHeight,
		searchResults = [],
	} = props


  // =====
  // state
  // =====

  const [ showResults, setShowResults ] = useState(false)


  // =====
  // hooks
  // =====

  const { colorMode } = useColorMode()


  // ========
  // function
  // ========

  // debounce input
	const handleOnBlur = () => {
		setTimeout(() => {
			setShowResults(false)
		}, 100)
	}


  // ==============
  // main component
  // ==============

  return (
		<Box
			position='relative'
			width='100%'
		>

      {/* Search input */}
			<InputGroup marginBottom='10px'>
        <InputLeftElement
          children={<Icon as={FaSearch} color='gray.500' />}
          pointerEvents='none'
        />

				<Input
					placeholder={placeholder}
					value={value}
          onBlur={handleOnBlur}
					onChange={onSearchChange}
					onFocus={() => setShowResults(true)}
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
                  variant='ghost'
                  onClick={() => (clearSearch ? clearSearch() : undefined)}
                />
              }
            />
          ) : undefined

        }

			</InputGroup>

      {/* Search results */}
			{
				showResults && (
					<Box
						bgColor={getColorForBackground(colorMode)}
						borderRadius='0.3em'
						boxShadow='0 2px 4px 0 rgb(34 36 38 / 12%), 0 2px 10px 0 rgb(34 36 38 / 15%);'
						maxHeight={searchResultsMaxHeight ?? '100vh'}
						overflowY='auto'
            position='absolute'
            sx={{'&::-webkit-scrollbar': {display: 'none'}}}
            width='100%'
            zIndex={1300}
					>
						{value.length > 0 && searchResults.length > 0
              ? searchResults
                .slice(0, maxSearchResults ?? searchResults.length)
                .map(result => {
                  return (
                    <Box
                      key={result[searchResultKey]}
                      borderBottom='1px solid rgba(34,36,38,.1)'
                      cursor='pointer'
                      _hover={{bgColor: getColorForBackgroundHover(colorMode)}}
                      onClick={() => onSearchResultSelect(result)}
                    >
                      <Flex alignItems='center'>
                        <Box 
                          color={getColorForText(colorMode)}
                          m={0}
                          p='0.8em' 
                        >
                          {searchResultRenderer(result)}
                        </Box>
                      </Flex>
                    </Box>
                  )}
							)	: value.length > 0 && (
									<Box
										borderBottom='1px solid rgba(34,36,38,.1)'
									>
                    {/* TODO: Update this */}
                    {noSearchResultsComponent ??
                      (
                        <Text textAlign='center'>No Search Results</Text>
                      )
                    }
									</Box>
								)
						}
					</Box >
				)
			}

		</Box>
	)
}
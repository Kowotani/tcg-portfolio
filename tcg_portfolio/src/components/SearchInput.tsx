import React, { PropsWithChildren, useState } from 'react'
import { Input, InputGroup, InputLeftElement, Box, Icon, BoxProps, Flex, Text } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa'

// https://github.com/GastonKhouri/chakra-ui-search/blob/main/src/components/Search.tsx

type TSearchInput = BoxProps & {
  value: string;
	onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	searchResultRenderer: (result: any) => JSX.Element;
  searchResultKey: string;
	onSearchResultSelect: (result: any) => void;
  maxSearchResults?: number;
	noSearchResultsComponent?: JSX.Element;
  placeholder?: string;
  searchResultsMaxHeight?: string;
  searchResults?: any[];
}

export const SearchInput = (props: PropsWithChildren<TSearchInput>) => {

  const {
		value,
		onSearchChange,
		searchResultRenderer,
		onSearchResultSelect,
    maxSearchResults,
    noSearchResultsComponent,
		placeholder = '',
    searchResultKey,
    searchResultsMaxHeight,
		searchResults = [],
	} = props

  const [ showResults, setShowResults ] = useState(false)

	const handleOnBlur = () => {
		setTimeout(() => {
			setShowResults(false)
		}, 100)
	};

  return (
		<Box
			position='relative'
			w='100%'
		>

      {/* Search input */}
			<InputGroup mb='10px'>
				{
					<InputLeftElement
						pointerEvents='none'
						children={<Icon as={FaSearch} color='gray.500' />}
					/>
				}

				<Input
					placeholder={placeholder}
					value={ value }
					onChange={onSearchChange}
					onFocus={() => setShowResults(true)}
					onBlur={handleOnBlur}
				/>
			</InputGroup>

      {/* Search results */}
			{
				showResults && (
					<Box
						bgColor='white'
						maxHeight={searchResultsMaxHeight ?? '100vh'}
						overflowY='auto'
						borderRadius='0.3em'
						boxShadow='0 2px 4px 0 rgb(34 36 38 / 12%), 0 2px 10px 0 rgb(34 36 38 / 15%);'
						sx={{'&::-webkit-scrollbar': {display: 'none'}}}
            position='absolute'
            zIndex={1300}
            width='100%'
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
                      _hover={{bgColor: '#f9fafb'}}
                      onClick={() => onSearchResultSelect(result)}
                    >
                      <Flex alignItems='center'>
                        <Box p='0.8em' margin='0' color='black'>
                          {searchResultRenderer(result)}
                        </Box>
                      </Flex>
                    </Box>
                  )}
							)	: value.length > 0 && (
									<Box
										borderBottom='1px solid rgba(34,36,38,.1)'
									>
									{noSearchResultsComponent ??
                    (
                      <Text>No Search Results</Text>
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
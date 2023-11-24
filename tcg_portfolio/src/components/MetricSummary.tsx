import { PropsWithChildren } from 'react'
import { 
  Box,
  HStack,
  Spacer,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import * as _ from 'lodash'
import { getFormattedPrice } from '../utils/Price'


// --------------
// Sub Components
// --------------

// -- MetricSummaryItem

type TMetricSummaryItemProps = TMetricSummaryItem & {
  variant: string
}
const MetricSummaryItem = (
  props: PropsWithChildren<TMetricSummaryItemProps>
) => {

  const {
    title,
    value,
    formattedPrefix = '',
    formattedPrecision = 0,
    formattedSuffix = '',
    placeholder,
    titleStyle,
    variant,
  } = props

  const isNegative = value 
    ? value < 0 
      ? '-' 
      : '' 
    : undefined
  const absValue = value 
    ? Math.abs(value) 
    : undefined
  const formattedPrice = absValue 
    ? getFormattedPrice(absValue, formattedPrefix, formattedPrecision, 
        formattedSuffix)
    : undefined

  return (
    <>
      {variant === 'list' 

        ? (
          <Box 
            display='flex' 
            justifyContent='space-between' 
            width='100%'
          >
            {titleStyle
              ? <Text style={titleStyle}>{title}</Text>
              : <Text as='b'>{title}</Text>
            }
            <Spacer minWidth={4}/>
            <Text>
              {value 
                ? (isNegative ? '-' : '') + formattedPrice
                : placeholder}
            </Text>
          </Box>

        ) : ['hcard', 'vcard'].includes(variant) ? (

          <Box>
            {titleStyle
              ? <Text style={titleStyle}>{title}</Text>
              : <Text as='b' align='center'>{title}</Text>
            }
            <Text align='center'>
              {value 
                ? (isNegative ? '-' : '') + formattedPrice
                : placeholder}
            </Text>
          </Box>

        ) : undefined
      }
    </>
  )
}


// ==============
// Main Component
// ==============

export type TMetricSummaryItem = {
  title: string,
  value?: number,
  formattedPrefix?: string,
  formattedPrecision?: number,
  formattedSuffix?: string,
  placeholder?: string,
  titleStyle?: {[key: string]: string},
}
export type TMetricSummaryProps = {
  summaryItems?: TMetricSummaryItem[],
  twoDimSummaryItems?: TMetricSummaryItem[][],
  variant?: 'hcard' | 'vcard' | 'list'
}
export const MetricSummary = (
  props: PropsWithChildren<TMetricSummaryProps>
) => {
 
  const {
    summaryItems = [],
    twoDimSummaryItems = [[]],
    variant = 'list',
  } = props

  return (
    <>
      {!_.isEmpty(twoDimSummaryItems[0])

        ? (
          <VStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            {twoDimSummaryItems.map(
              (itemRow: TMetricSummaryItem[]) => {

                return (
                  <HStack 
                    divider={<StackDivider color='gray.200'/>}
                    spacing={4}
                    display='flex'
                    justifyContent='space-evenly'
                    width='100%'
                  >
                    {itemRow.map(
                      (item: TMetricSummaryItem) => {
                        return (
                          <MetricSummaryItem
                            {...item}
                            key={item.title}
                            variant={variant}
                          />
                        )
                      }
                    )}
                  </HStack>
                )
              }
            )}
          </VStack>

      ) : variant === 'list' ? (

        <VStack           
          spacing={0}
          width='fit-content'      
        >
          {summaryItems.map(
            (item: TMetricSummaryItem) => {
              return (
                <MetricSummaryItem
                  {...item}
                  key={item.title}
                  variant={variant}
                />
              )
            }
          )}
        </VStack>

        ) : variant === 'hcard' ? (

          <HStack 
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
            display='flex'
            justifyContent='space-evenly'
            width='100%'              
          >
            {summaryItems.map(
              (item: TMetricSummaryItem) => {
                return (
                  <MetricSummaryItem
                    {...item}
                    key={item.title}
                    variant={variant}
                  />
                )
              }
            )}
          </HStack>

        ) : variant === 'vcard' ? (

          <VStack 
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
            display='flex'
            alignItems='center'
            width='fit-content'
          >
            {summaryItems.map(
              (item: TMetricSummaryItem) => {
                return (
                  <MetricSummaryItem
                    {...item}
                    key={item.title}
                    variant={variant}
                  />
                )
              }
            )}
          </VStack>

        ) : undefined
      }
    </>
  )
}
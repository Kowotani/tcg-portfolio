import { PropsWithChildren } from 'react';
import { 
  Box,
  HStack,
  Spacer,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import * as _ from 'lodash'
import { getBrowserLocale, getFormattedPrice } from '../utils'


// --------------
// Sub Components
// --------------

// -- TransactionSummaryItem

type TTransactionSummaryItemProps = TTransactionSummaryItem & {
  variant: string
}
const TransactionSummaryItem = (
  props: PropsWithChildren<TTransactionSummaryItemProps>
) => {

  const {
    title,
    value,
    formattedPrefix = '',
    formattedPrecision = 0,
    placeholder,
    titleStyle,
    variant,
  } = props

  const locale = getBrowserLocale()
  const isNegative = value 
    ? value < 0 
      ? '-' 
      : '' 
    : undefined
  const absValue = value 
    ? Math.abs(value) 
    : undefined
  const formattedPrice = absValue 
    ? getFormattedPrice(absValue, locale, formattedPrefix, formattedPrecision)
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

// // -- TransactionSummaryWrapper

// type TTransactionSummaryItemWrapper = {
//   item: TTransactionSummaryItem
//   variant: string,
// }
// const TransactionSummaryItemWrapper = (
//   props: PropsWithChildren<TTransactionSummaryItemWrapper>
// ) => {

//   return (
//     <TransactionSummaryItem 
//       title={props.item.title}
//       value={props.item.value}
//       prefix={props.item.formattedPrefix}
//       decimals={props.item.formattedPrecision}
//       placeholder={props.item.placeholder}
//       variant={props.variant}
//       titleStyle={props.item.titleStyle}
//     />
//   )
// }


// ==============
// Main Component
// ==============

export type TTransactionSummaryItem = {
  title: string,
  value?: number,
  formattedPrefix?: string,
  formattedPrecision?: number,
  placeholder?: string,
  titleStyle?: {[key: string]: string},
}
export type TTransactionSummaryProps = {
  summaryItems?: TTransactionSummaryItem[],
  twoDimSummaryItems?: TTransactionSummaryItem[][],
  variant?: 'hcard' | 'vcard' | 'list'
}
export const TransactionSummary = (
  props: PropsWithChildren<TTransactionSummaryProps>
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
              (itemRow: TTransactionSummaryItem[]) => {

                return (
                  <HStack 
                    divider={<StackDivider color='gray.200'/>}
                    spacing={4}
                    display='flex'
                    justifyContent='space-evenly'
                    width='100%'
                  >
                    {itemRow.map(
                      (item: TTransactionSummaryItem) => {
                        return (
                          <TransactionSummaryItem
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
            (item: TTransactionSummaryItem) => {
              return (
                <TransactionSummaryItem
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
              (item: TTransactionSummaryItem) => {
                return (
                  <TransactionSummaryItem
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
              (item: TTransactionSummaryItem) => {
                return (
                  <TransactionSummaryItem
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
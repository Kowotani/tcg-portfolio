import { PropsWithChildren } from 'react';
import { 
  Box,
  HStack,
  StackDivider,
  Text,
  VStack
} from '@chakra-ui/react'
import { ITransaction } from 'common'
import * as _ from 'lodash'
import { getBrowserLocale, getFormattedPrice } from '../utils'


// --------------
// Sub Components
// --------------

// -- TransactionSummaryItem

type TTransactionSummaryItemProps = {
  title: string,
  value: number,
  prefix?: string,
  decimals?: number,
  placeholder?: string,
  style?: string,
}
const TransactionSummaryItem = (
  props: PropsWithChildren<TTransactionSummaryItemProps>
) => {

  const {
    title,
    value,
    prefix = '',
    decimals = 0,
    placeholder,
    style = 'card'
  } = props

  const locale = getBrowserLocale()

  return (
    <>
      {style === 'card'
        ? (
          <Box>
            <Text as='b' align='center'>{title}</Text>
            <Text align='center'>
              {value 
                ? getFormattedPrice(value, locale, prefix, decimals)
                : placeholder}
            </Text>
          </Box>

        ) : style === 'list' ? (
          <Box display='flex' justifyContent='space-between'>
            <Text as='b'>{title}</Text>
            <Text>
              {value 
                ? getFormattedPrice(value, locale, prefix, decimals)
                : placeholder}
            </Text>
          </Box>

        ) : undefined
      }
    </>
  )
}

// -- TransactionSummaryWrapper

type TTransactionSummaryItemWrapper = {
  item: TTransactionSummaryItem
  transactions: ITransaction[],
  style?: string
}
const TransactionSummaryItemWrapper = (
  props: PropsWithChildren<TTransactionSummaryItemWrapper>
) => {

  return (
    <TransactionSummaryItem 
      title={props.item.title}
      value={props.item.fn(props.transactions) ?? 0}
      prefix={props.item.formattedPrefix}
      decimals={props.item.formattedPrecision}
      placeholder={props.item.placeholder}
      style={props.style}
    />
  )
}


// ==============
// Main Component
// ==============

export type TTransactionSummaryItem = {
  title: string,
  fn: (transactions: ITransaction[]) => number | undefined,
  formattedPrefix?: string,
  formattedPrecision?: number,
  placeholder?: string,
}
export type TTransactionSummaryProps = {
  transactions: ITransaction[],
  orientation?: 'horizontal' | 'vertical',
  style?: 'card' | 'list',
  summaryItems?: TTransactionSummaryItem[],
  twoDimSummaryItems?: TTransactionSummaryItem[][],
}
export const TransactionSummary = (
  props: PropsWithChildren<TTransactionSummaryProps>
) => {
 
  const {
    orientation = 'horizontal',
    style,
    transactions,
    summaryItems = [],
    twoDimSummaryItems = [[]]
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
                          <TransactionSummaryItemWrapper 
                            item={item} 
                            transactions={transactions}
                            style={style}
                          />
                        )
                      }
                    )}
                  </HStack>
                )
              }
            )}
          </VStack>

        ) : orientation === 'horizontal' ? (

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
                  <TransactionSummaryItemWrapper 
                    item={item} 
                    transactions={transactions}
                    style={style}
                  />
                )
              }
            )}
          </HStack>

        ) : orientation === 'vertical' ? (

          <VStack 
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
            display='flex'
            alignItems='center'
          >
            {summaryItems.map(
              (item: TTransactionSummaryItem) => {
                return (
                  <TransactionSummaryItemWrapper 
                    item={item} 
                    transactions={transactions}
                    style={style}
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
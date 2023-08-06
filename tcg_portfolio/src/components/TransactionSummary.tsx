import { PropsWithChildren } from 'react';
import { 
  Box,
  HStack,
  Spacer,
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
  variant: string,
  title: string,
  value: number,
  prefix?: string,
  decimals?: number,
  placeholder?: string,
  
}
const TransactionSummaryItem = (
  props: PropsWithChildren<TTransactionSummaryItemProps>
) => {

  const {
    variant,
    title,
    value,
    prefix = '',
    decimals = 0,
    placeholder,
  } = props

  const locale = getBrowserLocale()

  return (
    <>
      {variant === 'list' 

        ? (
          <Box display='flex' justifyContent='space-between' width='100%'>
            <Text as='b'>{title}</Text>
            <Spacer minWidth={4} />
            <Text>
              {value 
                ? getFormattedPrice(value, locale, prefix, decimals)
                : placeholder}
            </Text>
          </Box>

        ) : ['hcard', 'vcard'].includes(variant) ? (

          <Box>
            <Text as='b' align='center'>{title}</Text>
            <Text align='center'>
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
  variant: string,
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
      variant={props.variant}
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
  summaryItems?: TTransactionSummaryItem[],
  twoDimSummaryItems?: TTransactionSummaryItem[][],
  variant?: 'hcard' | 'vcard' | 'list'
}
export const TransactionSummary = (
  props: PropsWithChildren<TTransactionSummaryProps>
) => {
 
  const {
    transactions,
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
                          <TransactionSummaryItemWrapper 
                            item={item} 
                            transactions={transactions}
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
          width='100%'      
        >
          {summaryItems.map(
            (item: TTransactionSummaryItem) => {
              return (
                <TransactionSummaryItemWrapper 
                  item={item} 
                  transactions={transactions}
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
                  <TransactionSummaryItemWrapper 
                    item={item} 
                    transactions={transactions}
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
          >
            {summaryItems.map(
              (item: TTransactionSummaryItem) => {
                return (
                  <TransactionSummaryItemWrapper 
                    item={item} 
                    transactions={transactions}
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
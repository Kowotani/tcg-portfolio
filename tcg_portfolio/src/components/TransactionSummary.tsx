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

export type TTransactionSummaryItem = {
  title: string,
  fn: (transactions: ITransaction[]) => number | undefined,
  formattedPrefix?: string,
  formattedPrecision?: number,
  placeholder?: string,
}
export type TTransactionSummaryProps = {
  transactions: ITransaction[],
  summaryItems?: TTransactionSummaryItem[]
  twoDimSummaryItems?: TTransactionSummaryItem[][]
}
export const TransactionSummary = (
  props: PropsWithChildren<TTransactionSummaryProps>
) => {
 
  const locale = getBrowserLocale()
  
  // -------------
  // Sub Component
  // -------------

  type TSummaryItemProps = {
    title: string,
    value: number,
    prefix: string,
    decimals: number,
    placeholder?: string,
  }
  const SummaryItem = (props: PropsWithChildren<TSummaryItemProps>) => {
    return (
      <Box>
        <Text align='center' fontWeight='bold'>{props.title}</Text>
        <Text align='center'>{props.value 
          ? getFormattedPrice(props.value, locale, props.prefix, props.decimals)
          : props.placeholder}
        </Text>
      </Box>
    )
  }

  const isTwoDimensional = !_.isEmpty(props.twoDimSummaryItems)

    
  // ==============
  // Main Component
  // ==============

  return (
    <>
      {isTwoDimensional
        ? (
          <VStack
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
          >
            {props.twoDimSummaryItems && props.twoDimSummaryItems.map(
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

                        const value = item.fn(props.transactions) ?? 0
                        const prefix = item.formattedPrefix ?? ''
                        const decimals = item.formattedPrecision ?? 0

                        return (
                          <SummaryItem 
                            title={item.title}
                            value={value}
                            prefix={prefix}
                            decimals={decimals}
                            placeholder={item.placeholder}
                          />
                        )
                      }
                    )}
                  </HStack>
                )
              }
            )}
          </VStack>
        ) : (
          <HStack 
            divider={<StackDivider color='gray.200'/>}
            spacing={4}
            display='flex'
            justifyContent='space-evenly'
            width='100%'              
          >
            {props.summaryItems && props.summaryItems.map(
              (item: TTransactionSummaryItem) => {

                const value = item.fn(props.transactions) ?? 0
                const prefix = item.formattedPrefix ?? ''
                const decimals = item.formattedPrecision ?? 0

                return (
                  <SummaryItem 
                    title={item.title}
                    value={value}
                    prefix={prefix}
                    decimals={decimals}
                    placeholder={item.placeholder}
                  />
                )
              }
            )}
          </HStack>
        )
      }
    </>
  )
}
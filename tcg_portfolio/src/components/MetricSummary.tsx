import { PropsWithChildren } from 'react'
import { 
  Box,
  Flex,
  HStack,
  Spacer,
  StackDivider,
  Text,
  useColorMode,
  VStack
} from '@chakra-ui/react'
import { formatAsISO } from 'common'
import * as _ from 'lodash'
import { formatNumber, getColorForNumber } from '../utils/generic'


// =====
// types
// =====

export type TMetricSummaryItem = {
  title: string,
  value?: number,
  formatAsDate?: boolean,
  formattedPrefix?: string,
  formattedPrecision?: number,
  formattedSuffix?: string,
  isListSpacer?: boolean,
  placeholder?: string,
  titleStyle?: {[key: string]: string},
}


// ==============
// sub components
// ==============

// -- MetricSummaryItem

type TMetricSummaryItemProps = TMetricSummaryItem & {
  variant: string
}
const MetricSummaryItem = (
  props: PropsWithChildren<TMetricSummaryItemProps>
) => {

  // desstructure props
  const {
    title,
    value,
    formatAsDate,
    formattedPrefix,
    formattedPrecision,
    formattedSuffix,
    placeholder,
    titleStyle,
    variant,
  } = props

  // get colorMode
  const { colorMode } = useColorMode()
  const color = getColorForNumber(colorMode, value)

  // formatted value
  const formattedValue = formatAsDate
    ? formatAsISO(new Date(value as number))
    : formatNumber({
        value: value,
        prefix: formattedPrefix,
        suffix: formattedSuffix,
        precision: formattedPrecision,
        placeholder: placeholder
      })

  // default title
  const DefaultTitle = () => {
    return (<Text style={titleStyle}>{title}</Text>)
  }

  // main component

  return (
    <>
      {variant === 'list' 

        ? (
          <Flex 
            justifyContent='space-between' 
            width='100%'
          >
            {titleStyle
              ? <DefaultTitle />
              : <Text>{title}</Text>
            }
            <Spacer minWidth={2}/>
            <Text color={color}>
              {formattedValue}
            </Text>
          </Flex>

        ) : ['hcard', 'vcard'].includes(variant) ? (

          <Box>
            {titleStyle
              ? <DefaultTitle />
              : <Text as='b' align='center'>{title}</Text>
            }
            <Text align='center' color={color}>
              {formattedValue}
            </Text>
          </Box>

        ) : undefined
      }
    </>
  )
}


// ==============
// main component
// ==============

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

      {/* Two Dimensional */}
      {!_.isEmpty(twoDimSummaryItems[0]) && (
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
      )}

      {/* List */}
      {variant === 'list' && (
        <VStack           
          spacing={0}
          width='fit-content'      
        >
          {summaryItems.map(
            (item: TMetricSummaryItem) => {
              
              return (
                item.isListSpacer 
                ? <Box height={4}/>
                : ( 
                  <MetricSummaryItem
                    {...item}
                    key={item.title}
                    variant={variant}
                  />
                )
              )
            }
          )}
        </VStack>
      )}

      {/* Horizontal Cards */}
      {variant === 'hcard' && (
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
      )}

      {/* Vertical Cards */}
      {variant === 'vcard' && (
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
      )} 
    </>
  )
}
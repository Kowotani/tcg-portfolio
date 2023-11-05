import { PropsWithChildren, useState } from 'react'
import { 
  Box,
  Card,
  CardBody,
  HStack,
  Text,
  useRadio,
  useRadioGroup
} from '@chakra-ui/react'
import { 
  TDatedValue, formatInTimeZone
} from 'common'
import * as _ from 'lodash'
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps,
  XAxis, YAxis 
} from 'recharts'
import { 
  NameType, ValueType 
} from 'recharts/types/component/DefaultTooltipContent'
import { 
  ChartDateRange, TChartDataPoint, 

  dateAxisTickFormatter, getChartDataFromDatedValues, getChartDataKeys, 
  getDateAxisTicks, getStartDateFromChartDateRange, priceAxisTickFormatter
} from '../utils/Chart'
import { getBrowserLocale } from '../utils/generic'
import { getFormattedPrice } from '../utils/Price'


// =========
// constants
// =========

const BLUE = '#3182CE'
const GRAY = '#718096'


// =========
// functions
// =========

/*
DESC
  Get the width of the Price axis based on the longest value in the data
INPUT
  dataPoints: A TChartDataPoint[]
  dataKey: The name of the data series to use
RETURN
  The desired width of the Price axis
*/
function getPriceAxisWidth(
  dataPoints: TChartDataPoint[],
  dataKey: string
): number {

  // get min value
  const minValue = _.minBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.values[dataKey]
  })?.values[dataKey] as number

  // get max value
  const maxValue = _.maxBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.values[dataKey]
  })?.values[dataKey] as number

  const longestValue = _.max([Math.abs(minValue), Math.abs(maxValue)])

  return 15 + String(longestValue).length * 13
}


// ==========
// components
// ==========

// -------------
// Custom Toolip
// -------------

type TCustomTooltipProps<MyValue extends ValueType, MyName extends NameType> =
  TooltipProps<MyValue, MyName> & {
  primaryKey: string,
  referenceKey?: string
}
const CustomTooltip = (
  props: PropsWithChildren<TCustomTooltipProps<ValueType, NameType>>
) => {

  if (props.active) {

    // parse payload
    const payloadValue = _.first(props.payload) 
      ? _.first(props.payload)?.payload 
      : undefined
    const chartDataPoint = payloadValue as TChartDataPoint

    // create variables
    const date = formatInTimeZone(
      new Date(chartDataPoint.date), 'MMM d, yyyy', 'UTC')
    const primaryValue = getFormattedPrice(
      chartDataPoint.values[props.primaryKey], getBrowserLocale(), '$', 2
    )
    const referenceValue = props.referenceKey
      ? getFormattedPrice(
        chartDataPoint.values[props.referenceKey], getBrowserLocale(), '$', 2
      )
      : undefined

    return (
      <Card>
        <CardBody p={2}>
          <Text as='b' fontSize='medium'>{date}</Text>
          {/* Primary */}
          <Text fontSize='medium'>{props.primaryKey}: {primaryValue}</Text>
          {/* Reference */}
          {referenceValue &&
            <Text fontSize='medium'>{props.referenceKey}: {referenceValue}</Text>
          }
        </CardBody>
      </Card>
    )
  }

  return null
}


// ----------------
// Date Range Radio
// ----------------

const RadioCard = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        fontSize='medium'
        cursor='pointer'
        borderRadius={10}
        _checked={{
          bg: 'blue.500',
          color: 'white',
          borderColor: 'blue.500',
        }}
        px={3}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}


// -----------
// Price Chart
// -----------

type TPriceChartProps = {
  data: Map<string, TDatedValue[]>,
  dataKeys: {[key: string]: string},
  dateRange: ChartDateRange,
  isControlled: boolean,
  height: number,
  minWidth: number,
  setParentDateRange?: (dateRange: ChartDateRange) => void,
}
export const PriceChart = (props: PropsWithChildren<TPriceChartProps>) => {

  // =====
  // state
  // =====

  const [ internalDateRange, setInternalDateRange] = useState(props.dateRange)


  // ==========
  // chart data
  // ==========

  const dateRange = props.isControlled ? props.dateRange : internalDateRange

  // get dataKeys
  const { primaryKey, referenceKey } = getChartDataKeys(props.dataKeys)
  const primaryDataKey = `values.${primaryKey}`
  const referenceDataKey = referenceKey ? `values.${referenceKey}`: undefined
  const chartData = getChartDataFromDatedValues(props.data) 

  // get start and end dates
  const endDate = new Date()

  const startDate = dateRange === ChartDateRange.All
    ? new Date(Number(_.minBy(chartData, (dataPoint: TChartDataPoint) => {
        return dataPoint.date
      })?.date))
    : getStartDateFromChartDateRange(dateRange)

  const ticks = getDateAxisTicks(startDate, endDate, dateRange)


  // ================
  // date range radio
  // ================

  function onRadioChange(value: string): void {
    const dateRange = dateRangeMap.get(value) as ChartDateRange
    setInternalDateRange(dateRange)
    if (props.setParentDateRange) {
      props.setParentDateRange(dateRange)
    }
  }

  const dateRangeMap = new Map<string, ChartDateRange>([
    ['1M', ChartDateRange.OneMonth],
    ['3M', ChartDateRange.ThreeMonths],
    ['6M', ChartDateRange.SixMonths],
    ['1Y', ChartDateRange.OneYear],
    ['All', ChartDateRange.All]
  ])

  const dateRangeOptions = [...dateRangeMap.keys()]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'dateRange',
    defaultValue: 'All',
    onChange: (value) => onRadioChange(value)
  })

  const group = getRootProps()


  // ==============
  // main component
  // ==============

  return (
    <>
      <Box height={props.height} minWidth={props.minWidth} width='100%'>
        <ResponsiveContainer 
          height='100%'
          width='100%' 
        >
          <AreaChart data={chartData}>
            <XAxis 
              dataKey='date' 
              domain={[startDate.getTime(), endDate.getTime()]}
              scale='time'
              tickFormatter={dateAxisTickFormatter}
              tick={{fontSize: 18}}
              ticks={ticks}
              type='number'
            />
            <YAxis 
              tick={{fontSize: 18}}
              tickFormatter={priceAxisTickFormatter}
              width={getPriceAxisWidth(chartData, primaryKey)}
            />
            <CartesianGrid opacity={0.5} vertical={false}/>
            <Tooltip 
              content={
                <CustomTooltip 
                  primaryKey={primaryKey}
                  referenceKey={referenceKey}
                />
              }
            />
            <defs>
              <linearGradient id='colorPrice' x1={0} y1={0} x2={0} y2={1}>
                <stop offset='0%' stopColor={BLUE} stopOpacity={0.8}/>
                <stop offset='95%' stopColor={BLUE} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type='monotone' 
              dataKey={primaryDataKey}
              stroke={BLUE}
              strokeWidth={3}
              fill='url(#colorPrice)'
              fillOpacity={1}
            />
            {referenceDataKey &&
              <Area 
                type='monotone'
                dataKey={referenceDataKey}
                stroke={GRAY}
                strokeWidth={2}
                strokeDasharray='5 5'
                fillOpacity={0}
              />
            }
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      {!props.isControlled && (
        <Box minWidth={props.minWidth} marginTop={2}>
        <HStack display='flex' justifyContent='space-evenly' {...group}>
          {dateRangeOptions.map((value: any) => {
            const radio = getRadioProps({ value })
            return (
              <RadioCard key={value} {...radio}>
                {value}
              </RadioCard>
            )
          })}
        </HStack>
        </Box>
      )}
    </>
  )
}
import { PropsWithChildren, useState } from 'react'
import { 
  Box,
  Card,
  CardBody,
  Flex,
  HStack,
  Text,
  useColorMode,
  useRadio,
  useRadioGroup
} from '@chakra-ui/react'
import { 
  TDatedValue, formatInTimeZone
} from 'common'
import * as _ from 'lodash'
import { 
  Area, AreaChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, 
  Tooltip, TooltipProps, XAxis, YAxis 
} from 'recharts'
import { 
  NameType, ValueType 
} from 'recharts/types/component/DefaultTooltipContent'
import { 
  ChartDateRange, TChartDataPoint, 

  dateAxisTickFormatter, getChartDataFromDatedValues, getChartDataKeys, 
  getDateAxisTicks, getPnlChartDataFromDatedValues, 
  getStartDateFromChartDateRange, priceAxisTickFormatter
} from '../utils/Chart'
import { getColorForNumber } from '../utils/generic'
import { formatAsPrice } from '../utils/Price'


// =========
// constants
// =========

// ------
// layout
// ------

const BLUE = '#3182CE'
const GRAY = '#718096'
const GREEN = '#48BB78'
const RED = '#FC8181'

// ----------------
// date range radio
// ----------------

const dateRangeMap = new Map<string, ChartDateRange>([
  ['1M', ChartDateRange.OneMonth],
  ['3M', ChartDateRange.ThreeMonths],
  ['6M', ChartDateRange.SixMonths],
  ['1Y', ChartDateRange.OneYear],
  ['All', ChartDateRange.All]
])


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
  const minDataPoint = _.minBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.arrayValues && dataPoint.arrayValues[dataKey]
      ? _.head(dataPoint.arrayValues[dataKey]) as number
      : dataPoint.values && dataPoint.values[dataKey]
        ? dataPoint.values[dataKey]
        : undefined
  })
  const minValue = 
    minDataPoint && minDataPoint.arrayValues && minDataPoint.arrayValues[dataKey]
      ? _.head(minDataPoint.arrayValues[dataKey]) as number
      : minDataPoint && minDataPoint.values && minDataPoint.values[dataKey]
        ? minDataPoint.values[dataKey]
        : 0

  // get max value
  const maxDataPoint = _.maxBy(dataPoints, (dataPoint: TChartDataPoint) => {
    return dataPoint.arrayValues && dataPoint.arrayValues[dataKey]
      ? _.head(dataPoint.arrayValues[dataKey]) as number
      : dataPoint.values && dataPoint.values[dataKey]
        ? dataPoint.values[dataKey]
        : undefined
  })
  const maxValue = 
    maxDataPoint && maxDataPoint.arrayValues && maxDataPoint.arrayValues[dataKey]
      ? _.head(maxDataPoint.arrayValues[dataKey]) as number
      : maxDataPoint && maxDataPoint.values && maxDataPoint.values[dataKey]
        ? maxDataPoint.values[dataKey]
        : 0

  const longestValue = _.max([Math.abs(minValue), Math.abs(maxValue)])

  return 15 + String(longestValue).length * 13
}

/*
  DESC
    Handles radio button events to update the date range of the chart and,
    optionally, of the chart's parent date range
  INPUT
    value: Value from the radio change event
    setInternalDateRange: Function to set the chart's internal date range state
    setParentDateRange?: Function to set the chart's parent date range state
*/
function onRadioChange(
  value: string, 
  setInternalDateRange: (value: React.SetStateAction<ChartDateRange>) => void,
  setParentDateRange?: (value: ChartDateRange) => void
): void {
  const dateRange = dateRangeMap.get(value) as ChartDateRange
  setInternalDateRange(dateRange)
  if (setParentDateRange) {
    setParentDateRange(dateRange)
  }
}


// =====
// types
// =====

type TChartProps = {
  dataKeys: {[key: string]: string},
  dateRange: ChartDateRange,
  isControlled: boolean,
  minHeight: number,
  minWidth: number,
  height?: number,
  width?: number
  setParentDateRange?: (dateRange: ChartDateRange) => void,
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
  primaryKeyAlt?: string,
  referenceKey?: string,
}
const CustomTooltip = (
  props: PropsWithChildren<TCustomTooltipProps<ValueType, NameType>>
) => {

  // get colorMode
  const { colorMode } = useColorMode()

  if (props.active) {

    // parse payload
    const payloadValue = _.first(props.payload) 
      ? _.first(props.payload)?.payload 
      : undefined
    const chartDataPoint = payloadValue as TChartDataPoint

    // create variables
    const date = formatInTimeZone(
      new Date(chartDataPoint.date), 'MMM d, yyyy', 'UTC')
    const primaryValue = chartDataPoint.values 
      && chartDataPoint.values[props.primaryKey] 
    const primaryText = primaryValue 
      ? formatAsPrice(primaryValue) 
      : undefined
    const referenceValue = props.referenceKey 
      && chartDataPoint.values 
      && chartDataPoint.values[props.referenceKey]
    const referenceText = referenceValue 
      ? formatAsPrice(referenceValue) 
      : undefined

    // positive + negative, light + dark color
    const color = getColorForNumber(colorMode, primaryValue)

    return (
      <Card>
        <CardBody p={2}>
          <Flex justify='center'>
            <Text as='b' fontSize='medium'>
              {date}
            </Text>
          </Flex>

          {/* Primary */}
          <Flex justify='center'>
            <Text fontSize='medium'>
              {props.primaryKeyAlt ?? props.primaryKey}: 
            </Text>
            <Box width={2}/>
            <Text fontSize='medium' color={color}> 
              {primaryText} 
            </Text>
          </Flex>

          {/* Reference */}
          {referenceText &&
            <Flex justify='center'>
              <Text fontSize='medium'>
                {props.referenceKey}:
              </Text>
              <Box width={2}/>
              <Text fontSize='medium'>
                {referenceText}
              </Text>
            </Flex>
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


// =========
// PnL Chart
// =========

type TPnlChartProps = TChartProps & {
  data: Map<string, TDatedValue[]>,
}
export const PnlChart = (props: PropsWithChildren<TPnlChartProps>) => {

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
  const primaryKeyAlt = 
    primaryKey.includes('Profit and Loss') ? 'Profit' 
    : undefined
  const referenceDataKey = referenceKey ? `values.${referenceKey}`: undefined
  const profitAreaDataKey = 'arrayValues.Profit Area'
  const profitLineDataKey = 'values.Profit Line'
  const lossAreaDataKey = 'arrayValues.Loss Area'
  const lossLineDataKey = 'values.Loss Line'

  const chartData = getPnlChartDataFromDatedValues(props.data)

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

  const dateRangeOptions = [...dateRangeMap.keys()]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'dateRange',
    defaultValue: 'All',
    onChange: (value) => 
      onRadioChange(value, setInternalDateRange, props.setParentDateRange)
  })

  const group = getRootProps()


  // ==============
  // main component
  // ==============

  return (
    <>
        <ResponsiveContainer 
          minHeight={props.minHeight}
          minWidth={props.minWidth}
          height={props.height}
          width={props.width ?? '100%'}
        >
          <ComposedChart data={chartData}>

            {/* X-Axis */}
            <XAxis 
              dataKey='date' 
              domain={[startDate.getTime(), endDate.getTime()]}
              scale='time'
              tickFormatter={dateAxisTickFormatter}
              tick={{fontSize: 18}}
              ticks={ticks}
              type='number'
            />

            {/* Y-Axis */}
            <YAxis 
              tick={{fontSize: 18}}
              tickFormatter={priceAxisTickFormatter}
              width={getPriceAxisWidth(chartData, primaryKey)}
            />

            {/* Grid */}
            <CartesianGrid opacity={0.5} vertical={false}/>

            {/* Tooltip */}
            <Tooltip 
              content={
                <CustomTooltip 
                  primaryKey={primaryKey}
                  referenceKey={referenceKey}
                  primaryKeyAlt={primaryKeyAlt}
                />
              }
            />

            {/* Profit Area */}
            <Area 
              type='monotone' 
              dataKey={profitAreaDataKey}
              stroke={GREEN}
              strokeWidth={0}
              fill={GREEN}
              fillOpacity={0.4}
            />

            {/* Profit Line */}
            <Line
              type='monotone' 
              dataKey={profitLineDataKey}
              dot={false}
              stroke={GREEN}
              strokeWidth={3}
            />

            {/* Loss Area */}
            <Area 
              type='monotone' 
              dataKey={lossAreaDataKey}
              stroke={RED}
              strokeWidth={0}
              fill={RED}
              fillOpacity={0.4}
            />

            {/* Loss Line */}
            <Line
              type='monotone' 
              dataKey={lossLineDataKey}
              dot={false}
              stroke={RED}
              strokeWidth={3}
            />

            {/* Reference Value */}
            {referenceDataKey &&
              <Area 
                type='monotone'
                dataKey={referenceDataKey}
                stroke={GRAY}
                strokeWidth={2}
                strokeDasharray='5 5'
                fillOpacity={0.2}
              />
            }
          </ComposedChart>
        </ResponsiveContainer>
      

      {/* Radio Buttons */}
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


// ===========
// Price Chart
// ===========

type TPriceChartProps = TChartProps & {
  data: Map<string, TDatedValue[]>,
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

  const dateRangeOptions = [...dateRangeMap.keys()]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'dateRange',
    defaultValue: 'All',
    onChange: (value) => 
      onRadioChange(value, setInternalDateRange, props.setParentDateRange)
  })

  const group = getRootProps()


  // ==============
  // main component
  // ==============

  return (
    <>
      
        <ResponsiveContainer 
          minHeight={props.minHeight}
          minWidth={props.minWidth}
          height={props.height}
          width={props.width ?? '100%'}
        >
          <AreaChart data={chartData}>

            {/* X-Axis */}
            <XAxis 
              dataKey='date' 
              domain={[startDate.getTime(), endDate.getTime()]}
              scale='time'
              tickFormatter={dateAxisTickFormatter}
              tick={{fontSize: 18}}
              ticks={ticks}
              type='number'
            />

            {/* Y-Axis */}
            <YAxis 
              tick={{fontSize: 18}}
              tickFormatter={priceAxisTickFormatter}
              width={getPriceAxisWidth(chartData, primaryKey)}
            />

            {/* Grid */}
            <CartesianGrid opacity={0.5} vertical={false}/>

            {/* Tooltip */}
            <Tooltip 
              content={
                <CustomTooltip 
                  primaryKey={primaryKey}
                  referenceKey={referenceKey}
                />
              }
            />

            {/* Primary Value */}
            <Area 
              type='monotone' 
              dataKey={primaryDataKey}
              stroke={BLUE}
              strokeWidth={3}
              fill='url(#colorPrice)'
              fillOpacity={1}
            />
            <defs>
              <linearGradient id='colorPrice' x1={0} y1={0} x2={0} y2={1}>
                <stop offset='0%' stopColor={BLUE} stopOpacity={0.8}/>
                <stop offset='95%' stopColor={BLUE} stopOpacity={0}/>
              </linearGradient>
            </defs>            

            {/* Reference Value */}
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
      

      {/* Radio Buttons */}
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